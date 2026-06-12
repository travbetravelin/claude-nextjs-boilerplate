# Database Migrations

## Conventions

- Files are named `YYYYMMDDHHMMSS_<description>.sql` (Supabase CLI format).
- Every migration must be **reversible**: pair each `up` change with a matching rollback comment block.

```
-- migrate:up
ALTER TABLE users ADD COLUMN avatar_url text;

-- migrate:down
ALTER TABLE users DROP COLUMN avatar_url;
```

## Workflow

1. **Local / dev** — apply with `supabase db push` against your local stack (`supabase start`).
2. **Staging** — apply to the staging Supabase project before merging to `main`.
3. **Production** — merge to `main`; migrations run automatically via the `deploy.yml` workflow.

## Creating a new migration

```bash
supabase migration new <description>
# Edit the generated file in this directory
supabase db push          # apply locally
```
