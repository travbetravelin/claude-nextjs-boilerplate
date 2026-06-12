@AGENTS.md

# Claude Code — Working Agreement

This document defines how Claude Code operates in this repository. Read it before making any changes.

---

## Repo Structure

```
src/
  app/             # Next.js App Router pages & layouts
  components/      # Shared React components
  lib/
    supabase/      # Supabase clients (browser, server, middleware)
supabase/
  migrations/      # SQL migration files (see migrations/README.md)
.github/
  workflows/
    preview.yml    # Triggered on feature branches → deploys preview
    deploy.yml     # Triggered on main → deploys production
.env.example       # Copy to .env.local; never commit real values
vercel.json        # Vercel project config
```

---

## Claude's Role in This Repo

Claude Code always:

1. **Works on a feature branch** — never commits directly to `main`.
   - Branch naming: `claude/<short-description>` (e.g. `claude/add-auth-flow`)
2. **Commits and pushes** the feature branch when the task is complete.
3. **Returns a preview URL** from Vercel after the preview workflow runs so the user can review changes before merging.
4. **Merges to `main` only on explicit user approval** — Claude never merges without being told to.

---

## CI/CD Workflow

```
feature branch push
  └─ preview.yml ──► Vercel preview deploy ──► preview URL posted to PR
                                                       │
                                              User reviews & approves
                                                       │
                                              Merge PR to main
                                                       │
                              deploy.yml ──► DB migrations (staging first)
                                        ──► Vercel production deploy
```

---

## Environment Variables & Supabase Projects

Each Vercel environment maps to a **separate Supabase project**:

| Vercel env  | Supabase project | `NEXT_PUBLIC_APP_ENV` |
|-------------|------------------|-----------------------|
| Development | Local / dev      | `development`         |
| Preview     | Staging          | `staging`             |
| Production  | Production       | `production`          |

Variables to set in Vercel dashboard per environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `NEXT_PUBLIC_APP_ENV`

GitHub Actions secrets required:
- `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`
- `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN`, `PROD_SUPABASE_DB_PASSWORD`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Staging Indicator

When `NEXT_PUBLIC_APP_ENV=staging`, a staging indicator renders at the top of every page via `<StagingBanner />` in `src/components/StagingBanner.tsx`. It is injected once in `src/app/layout.tsx`.

**Default:** a blue full-width banner reading "STAGING ENVIRONMENT".

**To customize for a project**, edit `StagingBanner.tsx` — change the color, copy, position, or replace it with a badge/toast/overlay. The trigger condition (`NEXT_PUBLIC_APP_ENV !== "staging"`) should stay the same.

---

## Database Conventions

- Migration files live in `supabase/migrations/` — see `supabase/migrations/README.md`.
- Every migration must include a `-- migrate:down` rollback block.
- Apply to staging (preview) and verify before merging to main / applying to production.
- Use `supabase migration new <description>` to create new migration files.

---

## Local Development

```bash
cp .env.example .env.local
# Fill in your local/dev Supabase credentials

npm install
npm run dev
```

To run a local Supabase stack:
```bash
npx supabase start   # requires Docker
npx supabase db push # apply migrations locally
```
