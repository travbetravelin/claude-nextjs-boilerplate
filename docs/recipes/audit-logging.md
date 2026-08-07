# Recipe: Audit Logging (append-only, trigger-driven)

A single `audit_logs` table plus one generic trigger function records every
`INSERT`/`UPDATE`/`DELETE` on the tables you attach it to — full before/after row
snapshots as JSON, the acting user's `auth.uid()`, and a timestamp. No application code
is involved, so nothing can bypass it: any write path (app, RPC, SQL editor, service
role) is captured.

## Doctrine

1. **The log is append-only and is never rewritten.** No update or delete policies
   exist on `audit_logs`, and no migration or rollback ever removes rows from it. When
   a feature is rolled back, its audit rows stay in place — the log records what
   happened, including things that were later undone.
2. **Auditing must never block the operation it audits.** A failure inside the audit
   trigger (RLS, constraint, anything) is swallowed, not propagated — losing one audit
   row is better than rolling back a user's legitimate write.
3. **Attach the trigger to every table whose changes affect money, access, or
   configuration** — including the permission tables themselves, so grant changes are
   audited too.

## SQL

### The table

```sql
create table public.audit_logs (
  id           uuid        primary key default gen_random_uuid(),
  table_name   text        not null,
  record_id    uuid,
  action       text        not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data     jsonb,
  new_data     jsonb,
  -- Who made the change. Plain uuid, deliberately NO foreign key: an FK
  -- violation inside the trigger's exception guard would silently drop the
  -- audit row, which is worse than an unlinked id. NULL for service-role
  -- operations (e.g. an admin API route creating a user), which act outside
  -- a user session — auth.uid() is null there.
  performed_by uuid,
  performed_at timestamptz not null default now()
);

-- History of one record; and the "recent activity" viewer.
create index audit_logs_table_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_performed_at_idx on public.audit_logs (performed_at desc);
```

### RLS

Only triggers write here; reads are gated by a page grant (see the
roles-and-permissions recipe) so an "Audit Log" viewer page can later be granted to a
reviewer role without a migration. If you are not using that recipe, substitute your
admin check in the select policy. Note there are intentionally **no update or delete
policies** — append-only is enforced by omission.

```sql
alter table public.audit_logs enable row level security;

create policy "audit_logs_read" on public.audit_logs for select using (
  public.has_page(auth.uid(), 'audit_logs')   -- or: public.is_admin(auth.uid())
);

-- Belt-and-suspenders: the trigger runs SECURITY DEFINER so it bypasses RLS
-- anyway, but an explicit insert policy means the log still works even if the
-- function's definer property is ever lost in a refactor.
create policy "audit_logs_trigger_insert" on public.audit_logs
  for insert with check (true);
```

### The trigger function

Three details here are the difference between a log that works and one that silently
doesn't:

- **`to_jsonb(...)->>'id'` instead of `NEW.id`/`OLD.id`.** Referencing `.id` directly
  raises on tables with composite primary keys and no `id` column (join/grant tables).
  Worse, that error is caught by the exception guard — so those tables would log
  *nothing at all*, invisibly. Extracting via jsonb degrades to `record_id = null`
  instead, with the full row still captured in `old_data`/`new_data`.
- **The inner `BEGIN … EXCEPTION WHEN OTHERS THEN NULL` block** guarantees an audit
  failure never rolls back the audited operation (doctrine rule 2).
- **`SECURITY DEFINER` + `set search_path = ''`** lets the trigger insert regardless of
  the calling user's permissions, and hardens the definer function against
  search-path hijacking (which is why every table reference is schema-qualified).

```sql
create or replace function public.audit_trigger_fn()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec_id uuid;
begin
  begin
    -- Works on tables without an `id` column (composite PKs): degrades to
    -- null record_id instead of raising inside the exception guard.
    if TG_OP = 'DELETE' then
      rec_id := (to_jsonb(OLD)->>'id')::uuid;
    else
      rec_id := (to_jsonb(NEW)->>'id')::uuid;
    end if;

    insert into public.audit_logs
      (table_name, record_id, action, old_data, new_data, performed_by)
    values (
      TG_TABLE_NAME,
      rec_id,
      TG_OP,
      case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end,
      case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end,
      auth.uid()   -- null under the service role; that's expected
    );
  exception when others then
    null; -- never let audit failures block the triggering operation
  end;
  return coalesce(NEW, OLD);
end;
$$;
```

### Attaching it

One line per table. `create or replace trigger` makes re-running the migration safe.
`AFTER ... FOR EACH ROW` so the row's final state (including values set by `BEFORE`
triggers and defaults) is what gets logged.

```sql
create or replace trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.audit_trigger_fn();

create or replace trigger clients_audit
  after insert or update or delete on public.clients
  for each row execute function public.audit_trigger_fn();

create or replace trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_trigger_fn();

-- Audit the permission system itself, so access changes are on the record.
create or replace trigger roles_audit
  after insert or update or delete on public.roles
  for each row execute function public.audit_trigger_fn();

create or replace trigger role_pages_audit
  after insert or update or delete on public.role_pages
  for each row execute function public.audit_trigger_fn();

create or replace trigger role_features_audit
  after insert or update or delete on public.role_features
  for each row execute function public.audit_trigger_fn();
```

When you add a new audited-worthy table later, its migration should attach the trigger
in the same file that creates the table — coverage gaps are easy to introduce and hard
to notice, because a missing trigger produces no error, just silence.

## Rollback notes

A rollback of this recipe drops the triggers, the function, and (optionally) the
policies — but **leaves `audit_logs` and every row in it in place**. The same applies
to rollbacks of any audited feature: dropping a feature's tables never includes deleting
its audit rows. If a rollback restores an older version of `audit_trigger_fn()`, that is
a function redefinition, not a history rewrite — rows already written stay untouched.

## Reading the log

Per-record history for a detail-page "History" panel:

```sql
select action, old_data, new_data, performed_by, performed_at
from public.audit_logs
where table_name = 'projects' and record_id = $1
order by performed_at desc;
```

A field-level diff is best computed in the app from `old_data`/`new_data` (compare keys
whose values differ) rather than stored — storing full snapshots keeps the trigger
generic across all tables with zero per-table configuration.
