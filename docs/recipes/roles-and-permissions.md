# Recipe: Roles & Permissions (DB-driven RBAC)

A configurable role/permission system for a Supabase (Postgres + RLS) app. Instead of
hardcoding `role IN ('manager', 'admin')` checks into every RLS policy and every UI
component, permissions live in three small tables and two helper functions — so granting
a role a new page or feature is a row insert, not a migration, and the database and the
UI can never disagree about who is allowed to do what.

## The model

- **`roles`** — one row per role. Stable `uuid` primary key (roles can be renamed without
  breaking references), plus an `is_protected` flag for roles that must never be renamed
  or deleted (at minimum: `admin`).
- **`role_pages`** — "role X may VIEW page Y". A page is a whole screen/route.
- **`role_features`** — "role X may DO action Y". A feature is a write capability
  (`projects.manage`, `invoices.approve`, …), usually namespaced by page.
- **`has_page(uid, key)` / `has_feature(uid, key)` / `is_admin(uid)`** — `SECURITY DEFINER`
  lookup functions used by RLS policies, by RPCs, and by the app.

### Keys live in code; grants live in the database

The set of valid `page_key` / `feature_key` strings is defined in application code (a
single constants module, e.g. `src/lib/permissions.ts`) — it changes only when a
developer builds a new page or feature, so it ships with the code that uses it. *Which
roles hold each key* lives in `role_pages` / `role_features` — it changes at runtime via
an admin "Access Control" screen, with no deploy. Neither side can drift: code never
hardcodes a role name, and the DB never invents a key the code doesn't check.

### Hardcoded ceiling and hardcoded floor

Two things are deliberately **not** configurable:

- **Ceiling — admin sees everything.** `has_page()`/`has_feature()` return `true` for
  admin *without consulting the grant tables*, and admin is never seeded into
  `role_pages`/`role_features`. This means an empty or misconfigured grant table can
  never lock the admin out of the app — including out of the Access Control screen
  needed to fix the misconfiguration.
- **Floor — some pages are never gated.** Baseline pages every signed-in user needs
  (e.g. Dashboard, Account) are simply not checked against `role_pages` at all, and are
  intentionally absent from it — there is nothing to configure, so nothing to get wrong.

Also keep ownership-scoped rules ("a user may edit their own pending rows") out of this
system: they are per-row conditions, not per-role grants, and belong directly in RLS
policies or triggers.

## SQL

```sql
-- ── Roles ────────────────────────────────────────────────────────────────
-- uuid PK so a role can be renamed without touching referencing rows.
create table public.roles (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null unique,
  is_protected boolean     not null default false,
  created_at   timestamptz not null default now()
);

create table public.role_pages (
  role_id    uuid        not null references public.roles(id) on delete cascade,
  page_key   text        not null,
  created_at timestamptz not null default now(),
  primary key (role_id, page_key)
);

create table public.role_features (
  role_id     uuid        not null references public.roles(id) on delete cascade,
  feature_key text        not null,
  created_at  timestamptz not null default now(),
  primary key (role_id, feature_key)
);

-- Profiles reference roles by FK, so adding a role is just an insert into
-- `roles` — no CHECK-constraint migration needed.
-- (If profiles currently has `role text check (role in (...))`, drop that
-- constraint and add a role_id FK instead.)
alter table public.profiles
  add column role_id uuid not null references public.roles(id);

-- Seed. Admin is protected; admin is deliberately NOT seeded into the grant
-- tables (see has_page/has_feature below — the ceiling is hardcoded).
insert into public.roles (name, is_protected) values
  ('member', false),
  ('manager', false),
  ('admin', true);

insert into public.role_pages (role_id, page_key)
select r.id, k.page_key
from public.roles r
join (values
  ('manager', 'projects'),
  ('manager', 'reports')
) as k(role_name, page_key) on k.role_name = r.name;

insert into public.role_features (role_id, feature_key)
select r.id, k.feature_key
from public.roles r
join (values
  ('manager', 'projects.manage'),
  ('manager', 'reports.export')
) as k(role_name, feature_key) on k.role_name = r.name;
```

### Guard trigger: protect the admin role, and fail deletes helpfully

```sql
-- Prevent renaming/deleting protected roles, and surface "role still in use"
-- as a clear error instead of a raw FK violation.
create or replace function public.guard_role_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'DELETE' or (TG_OP = 'UPDATE' and NEW.name <> OLD.name) then
    if OLD.is_protected then
      raise exception 'The % role is protected and cannot be renamed or deleted.', OLD.name;
    end if;
  end if;
  if TG_OP = 'DELETE' then
    if exists (select 1 from public.profiles where role_id = OLD.id) then
      raise exception 'Cannot delete role "%" — users are still assigned to it. Reassign them first.', OLD.name;
    end if;
    return OLD;
  end if;
  return NEW;
end;
$$;

create trigger roles_guard before update or delete on public.roles
  for each row execute function public.guard_role_mutation();
```

### The helper functions

`SECURITY DEFINER` is load-bearing here: the grant tables' own RLS restricts direct
reads, but RLS policies on *other* tables must be able to evaluate `has_page()`/
`has_feature()` for any caller. A definer function reads the grant tables regardless of
who is asking. Always pair `security definer` with `set search_path = ''` (and
schema-qualify every table) so the function cannot be hijacked via a malicious schema on
the search path. Mark them `stable` so Postgres can cache the result within a statement.

```sql
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = uid and r.name = 'admin'
  );
$$;

-- Admin is hardcoded true, so the ceiling survives an empty/misconfigured
-- grant table.
create or replace function public.has_page(uid uuid, key text)
returns boolean language sql security definer set search_path = '' stable as $$
  select
    public.is_admin(uid)
    or exists (
      select 1 from public.profiles p
      join public.role_pages rp on rp.role_id = p.role_id and rp.page_key = key
      where p.id = uid
    );
$$;

create or replace function public.has_feature(uid uuid, key text)
returns boolean language sql security definer set search_path = '' stable as $$
  select
    public.is_admin(uid)
    or exists (
      select 1 from public.profiles p
      join public.role_features rf on rf.role_id = p.role_id and rf.feature_key = key
      where p.id = uid
    );
$$;
```

### RLS on the grant tables themselves

Subtle but critical: if only admins can `SELECT` the grant tables, then a non-admin
user's app session **cannot read its own grants** — the app's permission loader silently
gets zero rows and every grant appears to not exist for exactly the roles it was meant
for. Every user must be able to read the rows for their *own* role; holders of the
Access Control page additionally read everything (to render the full matrix). Writes
stay admin-only.

```sql
alter table public.roles         enable row level security;
alter table public.role_pages    enable row level security;
alter table public.role_features enable row level security;

create policy "roles_select" on public.roles for select using (
  public.has_page(auth.uid(), 'access_control')
  or id = (select role_id from public.profiles where id = auth.uid())
);
create policy "roles_write" on public.roles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "role_pages_select" on public.role_pages for select using (
  public.has_page(auth.uid(), 'access_control')
  or role_id = (select role_id from public.profiles where id = auth.uid())
);
create policy "role_pages_write" on public.role_pages for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "role_features_select" on public.role_features for select using (
  public.has_page(auth.uid(), 'access_control')
  or role_id = (select role_id from public.profiles where id = auth.uid())
);
create policy "role_features_write" on public.role_features for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
```

### Using the helpers in RLS on business tables

Never hardcode role names in business-table policies — check pages/features, so a grant
made in the Access Control UI takes effect at the database, not just in the UI:

```sql
-- Anyone may read a project if they hold a page that browses projects.
drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects for select using (
  owner_id = auth.uid()
  or public.has_page(auth.uid(), 'projects')
  or public.has_page(auth.uid(), 'reports')
);

-- Writes require the feature, not a role.
drop policy if exists "projects_insert" on public.projects;
create policy "projects_insert" on public.projects for insert with check (
  public.has_feature(auth.uid(), 'projects.manage')
);

drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects for update using (
  public.has_feature(auth.uid(), 'projects.manage')
);
```

**Also audit your triggers.** Any `BEFORE UPDATE` guard trigger that independently
hardcodes `role in (...)` will silently fight the RLS policies once grants move to the
DB: a role granted a feature passes RLS, then gets blocked by the stale trigger. Convert
every trigger-side role check to `has_feature()` in the same migration that converts the
policies.

### New-user default role

If profiles are auto-created by an `on_auth_user_created` trigger, that trigger must
supply a default role — otherwise a `NOT NULL` `role_id` makes **every** `auth.users`
insert fail (the trigger error rolls back the signup itself, breaking user creation
app-wide with no obvious symptom):

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    (select id from public.roles where name = 'member')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## App side

```ts
// src/lib/permissions.ts — the single source of truth for KEYS.
export const PAGES = [
  'projects', 'reports', 'manage_users', 'access_control', 'audit_logs',
] as const;

export const FEATURES = [
  'projects.manage', 'reports.export', 'users.manage',
] as const;

// The floor: routes every authenticated user can always see.
// Deliberately absent from role_pages — nothing to configure.
export const UNGATED_PAGES = ['dashboard', 'account'] as const;
```

On load, the app reads the current user's role's rows from `role_pages`/`role_features`
(RLS allows self-role reads, per above) and derives `canSee(page)` / `can(feature)`,
with the admin ceiling mirrored client-side (`role === 'admin'` ⇒ everything). The UI
checks are for showing/hiding controls only — **the database policies are the actual
enforcement**.

## Rollback notes

Dropping this system requires ordering: first restore hardcoded-role RLS policies on
business tables (they depend on `has_page`/`has_feature`), then drop the policies on the
grant tables, then the functions, then swap `profiles.role_id` back to a text column with
a CHECK constraint, then drop the tables. Any profile assigned to a role outside the
restored CHECK list must be reassigned first, or the constraint will reject it.
