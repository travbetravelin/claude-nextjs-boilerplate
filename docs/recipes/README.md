# Backend Recipes

Self-contained, copy-pasteable patterns for the Supabase (Postgres + RLS) side of this
template. Each recipe was distilled from a production application and carries the edge
cases that only surface in real use — SECURITY DEFINER search-path hardening, triggers
that must never block the operation they observe, unique indexes that have to go
partial the moment soft-deletes exist. All SQL is generic (`projects`, `clients`,
`rates`) and complete: nothing references the source application, and every recipe
stands on its own.

## The recipes

**[roles-and-permissions.md](./roles-and-permissions.md)** — a DB-driven RBAC system:
a `roles` table plus `role_pages`/`role_features` grant tables, queried through
`SECURITY DEFINER` helpers (`is_admin()`, `has_page()`, `has_feature()`) that both RLS
policies and the app share. Page/feature *keys* live in code; *grants* live in the
database, so the two can't drift and granting a role a capability is a row insert, not
a deploy. Admin is a hardcoded ceiling (always passes, never seeded, can't be locked
out by misconfiguration) and baseline pages are a hardcoded floor (never gated at all).
Reach for this the first time you catch yourself writing `role in ('x', 'y')` inside a
second RLS policy.

**[audit-logging.md](./audit-logging.md)** — one append-only `audit_logs` table and one
generic `audit_trigger_fn()` that records every insert/update/delete on attached tables:
full before/after JSON snapshots, the acting `auth.uid()`, and a timestamp. The trigger
swallows its own failures so auditing can never block a legitimate write, extracts the
record id via `to_jsonb()` so composite-PK tables log correctly, and the log is never
rewritten — rollbacks leave audit rows in place. Reach for this before the first table
that touches money, access, or configuration goes live; retrofitting coverage is easy,
but the history you didn't record is gone.

**[archiving-not-deleting.md](./archiving-not-deleting.md)** — the soft-delete
doctrine: `active boolean not null default true` on every admin-managed table, never a
hard delete. Archive always confirms, restore never does; cascades stop new activity
but never hide past activity (configuration children cascade in one transaction,
historical rows are never touched, shared references are never reached sideways, and
cascades run on archive only — never on restore). Partial unique indexes
(`... where active`) let an archived row free its uniqueness slot; atomic
`SECURITY DEFINER` RPCs make cascades and corrections all-or-nothing; impact-count RPCs
let confirmation dialogs quote real numbers ("this will affect N records"). Reach for
this the first time anyone asks for a Delete button on managed data.

## Migration conventions when applying these recipes

Follow `supabase/migrations/README.md` (files named `YYYYMMDDHHMMSS_<description>.sql`,
created via `supabase migration new <description>`, applied dev → staging → production).
On top of that, three conventions these recipes assume:

1. **Every migration opens with a why-comment block.** Before any SQL, a prose comment
   explains what the migration changes, why (including the bug or gap it closes, if
   any), and any design invariants the SQL encodes ("admin is never seeded here — see
   has_page()"). The migration file is where future readers look first; the comment is
   not optional documentation, it is the documentation.
2. **A paired rollback file in `supabase/migrations/rollbacks/` for every migration.**
   The rollback must actually reverse the migration. Order matters on the way down
   (drop dependent policies before the functions they call; restore old policies
   before dropping new helpers), and preconditions belong in a comment at the top of
   the rollback file ("any profile on a removed role must be reassigned first, or the
   restored CHECK will reject it").
3. **Destructive rollbacks are flagged loudly in their first line.** If running the
   rollback loses data (dropping a table, dropping a column that records provenance),
   the file opens with e.g.
   `-- DESTRUCTIVE: dropping contacts deletes every contact ever entered.` One
   deliberate exception: rollbacks never delete `audit_logs` rows — the audit log is
   append-only even across rollbacks, per the audit-logging recipe.
