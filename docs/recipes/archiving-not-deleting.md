# Recipe: Archiving, Not Deleting

Admin-managed data is never hard-deleted. Every managed table carries an `active`
flag, and "delete" everywhere in the app means "archive": the row stops participating
in new activity but remains for history, reporting, and restore. This recipe is the
full doctrine — rules first, then the SQL patterns that implement them.

## The doctrine

1. **Never hard delete.** Every admin-managed table gets
   `active boolean not null default true`. All pickers, dropdowns, and "live" list
   views filter `where active`; history and reporting views do not.

2. **Archiving always confirms; restoring never does.** Every Archive action shows a
   confirmation step before the row is updated — no Archive click fires immediately.
   Restore is additive and reversible, so it stays a single click everywhere.

3. **Archiving cascades to stop new activity, never to hide past activity.** A row's
   children fall into two categories with opposite treatment:
   - **Configuration/ownership children** — rows that only describe how the parent
     works *going forward* (a client's contacts, a parent's link rows, scoped settings).
     They have no independent meaning once the parent is archived, so they are archived
     too, **in the same transaction**. This is what "no orphaned data without valid
     meaning" means in practice.
   - **Historical/transactional children** — rows recording something that already
     happened (`time_entries`, `invoices`, anything already priced into accrued
     totals). A cascade **never** touches these. Hiding them would not be cleanup; it
     would be quietly rewriting history.

4. **Never cascade sideways into a shared reference.** A client owns its contacts, but
   not the `project` on the other end of a `client_projects` link — one project can
   serve many clients over its life. Archiving one relationship that happens to use a
   shared lookup value (`projects`, `categories`, `vehicles`, …) must never touch the
   lookup value itself. Cascade only flows *down an exclusive ownership tree*, never
   *across a shared one*.

5. **Cascades stop at the depth that already achieves full functional exclusion.**
   If everything that consumes a grandchild already filters on the child's `active`,
   the grandchild becomes inert the moment its parent is archived — don't flip its flag
   too. Fewer touched rows means simpler restores and less to reason about.

6. **Cascades only run on archive, never on restore.** Restoring a parent flips only
   the parent's `active` back. It does not resurrect the children that were cascaded
   off — an admin deliberately chooses what comes back, rather than everything silently
   reviving at once.

7. **A successful terminal state is not an archive.** A project reaching
   `status = 'complete'` may flip `active` the same way, but it is the intended end
   state, not "this shouldn't have existed" — do not extend the cascade rule to it.

8. **Partial unique indexes, `where active`.** Uniqueness constraints must apply only
   to living rows, so archiving frees the slot (see below).

9. **Multi-row archive operations are atomic RPCs**, and any confirmation that could
   hide accrued data quotes real numbers from an impact-count RPC.

## SQL patterns

### The flag

```sql
alter table public.clients
  add column if not exists active boolean not null default true;
```

Every admin-managed table gets this. "Archive" is `update ... set active = false`;
"Restore" is `set active = true`.

### Partial unique indexes — archiving frees the slot

A plain unique constraint covers archived rows too, so the natural
"archive the typo, add the corrected row" flow fails with a unique violation in exactly
the case it exists for — same natural key, only the payload differing. Make uniqueness
partial so only living rows compete:

```sql
-- One live row per natural key; archived rows never block a replacement.
create unique index rates_effective_date_unique
  on public.rates (effective_date) where active;

-- Compound example: one active "primary" contact per client. Partial on
-- (is_primary and active) so an archived primary never blocks a living one
-- from taking the slot.
create unique index contacts_one_primary_per_client
  on public.contacts (client_id) where (is_primary and active);
```

Two traps:

- A table-level `UNIQUE` **constraint** cannot be made partial — swap it for a partial
  unique **index** (`alter table ... drop constraint ...;` then `create unique index
  ... where active;`).
- Nullable columns in a compound uniqueness key don't collide under a plain index
  (`null <> null`). Coalesce them into the index expression:

```sql
create unique index rates_scope_effective_unique on public.rates (
  coalesce(category_id::text, ''), coalesce(region_id::text, ''), effective_date
) where active;
```

### Atomic archive-cascade RPCs

A cascade issued as separate client calls can partially fail, leaving children quietly
still accruing under a parent nobody thinks is active. Put the whole cascade in one
`SECURITY DEFINER` function — a Postgres function body is a single transaction. Because
a definer function bypasses RLS, it must **explicitly assert the same permission the
tables' own write policies enforce**, up front (the check cannot be implicit):

```sql
-- Archive a client: the client, its link rows to projects, and each link's
-- config children, in one transaction. Historical rows (time_entries,
-- invoices) are deliberately untouched — rule 3. The shared `projects` rows
-- on the other end of the links are deliberately untouched — rule 4.
create or replace function public.archive_client(p_client_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_feature(auth.uid(), 'clients.manage') then
    raise exception 'Not permitted to manage clients';
  end if;

  update public.clients set active = false where id = p_client_id;

  update public.contacts set active = false
  where client_id = p_client_id and active;

  update public.client_projects set active = false
  where client_id = p_client_id and active;

  update public.project_budget_lines set active = false
  where active and client_project_id in (
    select id from public.client_projects where client_id = p_client_id
  );
  -- Deeper config rows scoped to budget lines are NOT touched: everything
  -- that consumes them already filters on project_budget_lines.active, so
  -- they are inert the moment their owning line is inactive — rule 5.
end;
$$;

-- Definer functions default to EXECUTE for public — lock them down.
revoke all on function public.archive_client(uuid) from public, anon;
grant execute on function public.archive_client(uuid) to authenticated;
```

Restore has **no** RPC counterpart doing the reverse cascade — rule 6. Restore is a
plain single-row `update ... set active = true` under normal RLS.

### Impact-count RPCs — confirmations quote real numbers

Where archiving could plausibly hide already-accrued data, the confirmation dialog must
name concrete numbers ("This will affect 412.5 logged hours and 37 invoices"), not a
generic "Are you sure?". Back each such confirmation with a read-only `stable` RPC.

Shape notes, all deliberate:

- **Permission-gated by empty result, not by raising.** The `has_feature()` check sits
  in the `where` clause of the anchoring CTE; an unauthorized caller gets zeros, and the
  UI simply has nothing to show. This keeps the function trivially safe to call while
  rendering, before any click.
- `stable`, read-only, `security definer set search_path = ''` like the others.
- Return a named-column `table` so the client gets labeled numbers.

```sql
create or replace function public.client_archive_impact(p_client_id uuid)
returns table (hours_logged numeric, invoice_count integer)
language sql security definer set search_path = '' stable as $$
  with links as (
    select cp.id, cp.project_id
    from public.client_projects cp
    where cp.client_id = p_client_id
      and public.has_feature(auth.uid(), 'clients.manage')  -- unauthorized ⇒ zero rows
  ),
  hours as (
    select coalesce(sum(te.hours), 0) as total
    from public.time_entries te
    join links l on l.project_id = te.project_id
  ),
  inv as (
    select count(*) as total
    from public.invoices i
    join links l on l.id = i.client_project_id
    where i.status <> 'void'          -- count only rows that carry real history
  )
  select hours.total, inv.total::integer from hours, inv;
$$;

revoke all on function public.client_archive_impact(uuid) from public, anon;
grant execute on function public.client_archive_impact(uuid) to authenticated;
```

Confirmation shape varies with what's at stake: a plain "Archive this X?" prompt where
nothing meaningful is hidden (lookup tables whose historical children are exempt by
rule 3 — there is nothing to compute), versus the impact-aware confirmation wherever
the action could plausibly affect accrued data. Build one shared Archive-button
component for the plain case; richer flows render the impact numbers inline.

### Atomic correct-in-place (archive old + insert new)

The companion to partial unique indexes: fixing a row that was *never right* (a typo,
not a legitimate historical change) is archive-old-plus-insert-new in **one** function —
two separate client calls could leave the old row archived with no replacement if the
second failed. Keep provenance on the new row:

```sql
alter table public.rates add column if not exists corrects_id uuid references public.rates(id);
alter table public.rates add column if not exists correction_note text;

create or replace function public.correct_rate(
  p_id uuid, p_amount numeric, p_effective_date date, p_note text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  if not public.has_feature(auth.uid(), 'rates.manage') then
    raise exception 'Not permitted to manage rates';
  end if;

  update public.rates set active = false where id = p_id and active;
  if not found then
    -- Concurrency guard: someone else corrected/archived it first.
    raise exception 'That rate no longer exists or has already been archived — reload and try again';
  end if;

  insert into public.rates (amount, effective_date, corrects_id, correction_note)
  values (p_amount, p_effective_date, p_id, nullif(btrim(p_note), ''))
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.correct_rate(uuid, numeric, date, text) from public, anon;
grant execute on function public.correct_rate(uuid, numeric, date, text) to authenticated;
```

The `where id = p_id and active` + `if not found` pair is the concurrency check: a
stale client can't double-correct or resurrect an already-replaced row.

## Rollback notes

Rolling back archive-cascade / impact functions is just `drop function if exists ...` —
they hold no data. Rolling back an `active` column is destructive only in the sense
that it forgets *which* rows were archived; flag that loudly in the rollback file.
Rows archived by a cascade are not automatically restored by any rollback — un-archiving
is always a deliberate, per-row decision (rule 6 applies to rollbacks too).
