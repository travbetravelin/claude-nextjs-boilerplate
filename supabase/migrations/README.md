# Database Migrations

## Conventions

- Files are named `YYYYMMDDHHMMSS_<description>.sql` (Supabase CLI format).
- Every migration must be **reversible**: pair each migration with a rollback
  file of the same name in `rollbacks/` (e.g. `rollbacks/rollback_<description>.sql`).

> Why separate files instead of an `-- migrate:down` block inside the
> migration? `supabase db push` executes the *entire* file — a rollback block
> in the same file would run immediately after the migration and undo it.
> The `rollbacks/` subdirectory is ignored by `db push`, so rollback SQL is
> stored safely and only ever run by hand.

- Every migration file opens with a comment block explaining **why** the
  change is being made, not just what it does.
- If a rollback destroys data, its file says so loudly in the first line
  (e.g. `-- DESTRUCTIVE: drops the category column and all values in it.`).
- Migration files are never edited after being applied — create a new
  migration to correct or reverse one.

**Example** — `20260807120000_add_avatar_url.sql`:

```sql
-- Adds avatar_url to profiles so users can upload a profile photo.
-- Nullable on purpose: "no photo yet" is a normal state, not an error.
ALTER TABLE profiles ADD COLUMN avatar_url text;
```

`rollbacks/rollback_add_avatar_url.sql`:

```sql
-- DESTRUCTIVE: removes avatar_url and every stored photo reference.
ALTER TABLE profiles DROP COLUMN avatar_url;
```

## Workflow

1. **Local / dev** — apply with `supabase db push` against your local stack (`supabase start`).
2. **Staging** — applied automatically by `deploy.yml` when merging to `main` (staging runs first).
3. **Production** — applied by `deploy.yml` after staging succeeds.

**To roll back in staging or production:** run the matching `rollbacks/` file
via the Supabase SQL editor, confirm with a `SELECT`, then create a new
migration that records the reversal so the migration history stays truthful.

## Creating a new migration

```bash
supabase migration new <description>
# Edit the generated file in this directory
# Write the paired rollback file in rollbacks/
supabase db push          # apply locally
```
