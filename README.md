# claude-nextjs-boilerplate

Boilerplate for Next.js apps developed through Claude Code sessions — minimal external touchpoints for the user.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
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
5. After the project is created, collect these values:
   - **Project Settings → General** → copy **Project ID** → `VERCEL_PROJECT_ID`
   - **Team/Account Settings → General** → copy **Team ID** → `VERCEL_ORG_ID`
   - **Account Settings → Tokens** → create a token → `VERCEL_TOKEN`

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
| `VERCEL_TOKEN` | from step 3 |
| `VERCEL_ORG_ID` | from step 3 |
| `VERCEL_PROJECT_ID` | from step 3 |
| `STAGING_SUPABASE_URL` | staging project URL |
| `STAGING_SUPABASE_ANON_KEY` | staging anon key |
| `PROD_SUPABASE_URL` | production project URL |
| `PROD_SUPABASE_ANON_KEY` | production anon key |
| `SUPABASE_ACCESS_TOKEN` | Supabase account settings → Access tokens |
| `PROD_SUPABASE_DB_PASSWORD` | production project database password (set when you created the project) |

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

1. `preview.yml` runs on GitHub Actions — type-check, lint, build, Vercel preview deploy
2. A preview URL appears in the Actions run output (and as a PR comment if a PR is open)
3. The blue staging banner is visible at the top of the preview

Merge to `main` and confirm:

1. `deploy.yml` runs — migrations apply to production Supabase, then Vercel production deploys
2. Production URL is live with no staging banner

---

## How This Repo Works

See [`CLAUDE.md`](./CLAUDE.md) for Claude Code's working agreement:
- Branching strategy and Claude's role
- CI/CD flow (feature branch → preview URL → merge → production)
- Environment variable mapping (dev / staging / production)
- Database migration conventions
- Staging banner customization
