# claude-nextjs-boilerplate

Boilerplate for Next.js apps developed through Claude Code sessions — minimal external touchpoints for the user.

## Stack

- **Next.js** (App Router) + TypeScript
- **Design system** — token-driven global CSS (`src/app/globals.css`, no Tailwind) + a shared component kit in `src/components/ui/` (see `COMPONENTS.md` and `docs/design-system.md`)
- **Supabase** — auth, database, per-environment projects
- **Vercel** — preview and production deployments via GitHub Actions

---

## Starting a New Project from This Boilerplate

Follow these steps in order. By the end you will have a running app in three environments: local (optional), staging (preview), and production.

### 1. Create a New Repo

On GitHub, click **"Use this template" → "Create a new repository"**, give it a name, and create it.

> If you're using **Claude Code on the web**, you don't need to clone the repo locally — Claude runs in a remote container and clones it automatically when a session starts. Skip to step 2.

If you want to run the app on your own machine:
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

---

### 2. Create Supabase Projects

You need two Supabase projects — one for staging, one for production.

For each (staging, production):

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it clearly (e.g. `my-app-staging`, `my-app-production`)
3. After it provisions, go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, never expose to the browser)

Save these — you'll need them in steps 4 and 5.

---

### 3. Create a Vercel Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your new GitHub repo
3. Leave build settings as-is (`vercel.json` handles them)
4. **Do not deploy yet** — add environment variables first (next step)

Importing the repo connects Vercel's git integration, which handles **all
deploys**: every feature branch gets a preview automatically, and every push
to `main` deploys to production. GitHub Actions runs the quality checks and
database migrations only — no Vercel tokens or secrets are needed.

---

### 4. Configure Vercel Environment Variables

In your Vercel project go to **Settings → Environment Variables**. Add each variable and scope it to the correct environment:

| Variable | Development | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | dev project URL | staging project URL | production project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon key | staging anon key | production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | dev service role key | staging service role key | production service role key |
| `NEXT_PUBLIC_APP_ENV` | `development` | `staging` | `production` |

---

### 5. Add GitHub Actions Secrets

In your GitHub repo go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `STAGING_SUPABASE_URL` | staging project URL |
| `STAGING_SUPABASE_ANON_KEY` | staging anon key |
| `PROD_SUPABASE_URL` | production project URL |
| `PROD_SUPABASE_ANON_KEY` | production anon key |
| `SUPABASE_ACCESS_TOKEN` | Supabase account settings → Access tokens |
| `SUPABASE_PROJECT_REF` | production project reference ID (Supabase Project Settings → General) |
| `PROD_SUPABASE_DB_PASSWORD` | production project database password (set when you created the project) |
| `STAGING_SUPABASE_PROJECT_REF` | staging project reference ID |
| `STAGING_SUPABASE_DB_PASSWORD` | staging project database password |

**Recommended: protect `main`.** In **Settings → Branches**, add a branch protection rule for `main` requiring the preview checks to pass before merging. This makes the "preview first, then merge" workflow enforced by GitHub rather than by convention — important if non-technical collaborators drive Claude Code sessions on this repo.

---

### 6. Local Development (optional)

Only needed if you want to run the app on your own machine. If you're developing exclusively through Claude Code on the web, skip this.

```bash
cp .env.example .env.local
# Fill in your dev Supabase project credentials

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Optional: run a fully local Supabase stack** (requires Docker):
```bash
npx supabase start   # starts local Supabase instance
npx supabase db push # applies migrations
```
Use the credentials printed by `supabase start` in your `.env.local`.

---

### 7. Verify the CI/CD Pipeline

Push a feature branch and confirm:

1. `preview.yml` ("Checks") runs on GitHub Actions — type-check, lint, tests, build
2. Vercel's git integration deploys a preview of the branch (URL in the Vercel dashboard, and as a Vercel bot comment if a PR is open)
3. The staging banner is visible at the top of the preview

Merge to `main` and confirm:

1. `deploy.yml` ("Production Migrations") runs — checks, then migrations apply to staging Supabase first, then production Supabase
2. Vercel deploys `main` to production; the production URL is live with no staging banner

---

## How This Repo Works

See [`CLAUDE.md`](./CLAUDE.md) for Claude Code's working agreement:
- Branching strategy and Claude's role
- CI/CD flow (feature branch → preview URL → merge → production)
- Environment variable mapping (dev / staging / production)
- Database migration conventions
- Staging banner customization
