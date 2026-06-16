# Project Setup Guide

Follow these steps in order. By the end you will have a working app deployed to staging (preview) and production, with all credentials wired and Claude connected to your project.

**You do not need to write any code to complete this setup.**

---

## What You'll Need Accounts For

Before starting, make sure you have accounts at:

- [github.com](https://github.com) — where the code lives
- [supabase.com](https://supabase.com) — your database and authentication
- [vercel.com](https://vercel.com) — where the app is hosted

You'll also need the **Claude desktop app** installed on your Mac. Download it at [claude.ai/download](https://claude.ai/download) if you haven't already.

---

## A Note on Saving Credentials

Several steps below ask you to copy keys and tokens. Keep a private notes document (like Apple Notes or a password manager such as 1Password or Bitwarden) open as you go and paste each value in as you collect it. You'll need them again in later steps.

> ⚠️ Treat these credentials like passwords. Never paste them into a chat, email, or shared document.

---

## Step 1 — Create Your GitHub Repo

1. Go to [github.com/travbetravelin/claude-nextjs-boilerplate](https://github.com/travbetravelin/claude-nextjs-boilerplate)
2. Click **"Use this template" → "Create a new repository"**
3. Give it a name that reflects your project (e.g. `my-app`)
4. Set visibility to **Private**
5. Click **"Create repository"**

You don't need to download or clone anything — Claude will work directly from the GitHub repo.

---

## Step 2 — Create Two Supabase Projects

You need one project for **staging** and one for **production**. These must always remain separate — staging is for testing, production is what your users see.

Repeat the following steps twice. Name your projects clearly so you can tell them apart, e.g. `my-app-staging` and `my-app-production`.

1. Go to [supabase.com](https://supabase.com) → click **"New project"**
2. Choose your organization, give it a name, create a strong database password, and pick a region close to you
3. **Save the database password in your notes doc** — you'll need the production one in Step 5
4. Wait for provisioning to finish (about 1 minute)
5. Go to **Project Settings → API** and copy these three values into your notes doc:

| What to copy | Where to find it | Label it in your notes |
|---|---|---|
| Project URL | Settings → API → Project URL | `SUPABASE_URL` |
| Anon / public key | Settings → API → Project API keys | `SUPABASE_ANON_KEY` |
| Service role key | Settings → API → Project API keys (reveal it) | `SUPABASE_SERVICE_ROLE_KEY` |

Do this twice — once for staging, once for production — so you have two complete sets of credentials.

> ⚠️ The service role key has full access to your database. Never share it or let it appear anywhere in the app itself.

---

## Step 3 — Create a Vercel Project

1. Go to [vercel.com](https://vercel.com) → click **"Add New Project"**
2. Click **"Import Git Repository"** — connect your GitHub account if prompted
3. Select your new repo from the list
4. Leave all build settings as-is — the repo's `vercel.json` handles them
5. **Do not click Deploy yet** — add environment variables first (Step 4)

After the project is created, collect these values into your notes doc:

| What to copy | Where to find it | Label it in your notes |
|---|---|---|
| Project ID | Project Settings → General → Project ID | `VERCEL_PROJECT_ID` |
| Team ID | Your account/team Settings → General → Team ID | `VERCEL_ORG_ID` |
| Token | Account Settings → Tokens → Create token (name it `claude-code`) | `VERCEL_TOKEN` |

### Set the Production Branch

Still in Vercel, go to **Project Settings → Git** and set **Production Branch** to `main`. This tells Vercel that merging to `main` triggers a production deployment.

---

## Step 4 — Add Environment Variables in Vercel

In your Vercel project, go to **Settings → Environment Variables**.

Add each variable below. For each one, Vercel will ask which environments it applies to — assign them exactly as shown.

| Variable | Development | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | staging URL | staging URL | production URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | staging anon key | staging anon key | production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | staging service role key | staging service role key | production service role key |
| `NEXT_PUBLIC_APP_ENV` | `development` | `staging` | `production` |

> Note: Development and Preview both use the staging Supabase project. Only Production uses the production Supabase project.

---

## Step 5 — Add Secrets to GitHub Actions

In your GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret**.

Add each of the following. The secret name must match exactly — no extra spaces.

| Secret name | Value |
|---|---|
| `VERCEL_TOKEN` | from Step 3 |
| `VERCEL_ORG_ID` | from Step 3 |
| `VERCEL_PROJECT_ID` | from Step 3 |
| `STAGING_SUPABASE_URL` | staging project URL |
| `STAGING_SUPABASE_ANON_KEY` | staging anon key |
| `PROD_SUPABASE_URL` | production project URL |
| `PROD_SUPABASE_ANON_KEY` | production anon key |
| `SUPABASE_ACCESS_TOKEN` | Go to Supabase → Account Settings → Access Tokens → Generate new token |
| `PROD_SUPABASE_DB_PASSWORD` | The password you set when creating the production Supabase project |
| `SUPABASE_PROJECT_REF` | Go to your production Supabase project → Settings → General → Reference ID |

---

## Step 6 — Trigger the First Deployment

Now that environment variables are in place, go back to your Vercel project and click **Deploy** to trigger the first build. This confirms the project is wired correctly before Claude starts making changes.

Once it finishes, Vercel will show you two URLs:
- A **preview URL** (ends in `-git-main-...vercel.app`) — this is staging
- Your **production URL** — this is what users will visit

Open both and confirm they load without errors.

---

## Step 7 — Verify the CI/CD Pipeline

Ask Claude to make a small visible change (e.g. update the page title), push it to a feature branch, and confirm:

**On the feature branch (staging):**
- [ ] The GitHub Actions `preview.yml` workflow runs and passes
- [ ] Claude shares a preview URL
- [ ] The preview URL loads the app with a **blue "STAGING ENVIRONMENT" banner** at the top

**After merging to `main` (production):**
- [ ] The `deploy.yml` workflow runs and passes
- [ ] The production URL loads the app with **no staging banner**

If either fails, check:
1. All secret names in Step 5 match exactly — no extra spaces or typos
2. All environment variables in Step 4 are scoped to the right environments
3. The GitHub Actions log shows a specific error message — share it with Claude and it will diagnose it

---

## Step 8 — Connect Claude to Your Project (MCP Setup)

MCP (Model Context Protocol) lets Claude connect directly to GitHub, Supabase, and Vercel during a session — so it can read deployment logs, inspect your database, manage branches, and more, without you copying and pasting anything manually.

This is a one-time setup on your Mac.

### Before You Start: Install Node.js

Claude's connections to GitHub and Supabase require Node.js to be installed on your Mac.

1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** version
2. Open the downloaded file and follow the installer
3. To confirm it worked: open Terminal (press `Cmd + Space`, type `Terminal`, press Enter) and type:
   ```
   node --version
   ```
   You should see a version number like `v20.x.x`

### Create Access Tokens

**GitHub token:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name it `claude-code`, set expiration to 90 days
4. Check these scopes: `repo` and `workflow`
5. Click **Generate token** and copy it to your notes doc immediately — GitHub only shows it once

**Supabase token:**
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **"Generate new token"**, name it `claude-code`
3. Copy it to your notes doc — you'll only see it once

**Vercel token:**
You already created this in Step 3. Use the same `VERCEL_TOKEN` value.

### Edit the Claude Config File

1. Open the **Claude desktop app**
2. Go to **Claude menu → Settings → Developer**
3. Click **"Edit Config"** — this opens a file called `claude_desktop_config.json`
4. Replace the entire contents of that file with the following, substituting your actual tokens where indicated:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_SUPABASE_TOKEN_HERE"
      ]
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "vercel-mcp-adapter"],
      "env": {
        "VERCEL_API_TOKEN": "YOUR_VERCEL_TOKEN_HERE"
      }
    }
  }
}
```

5. Save the file
6. Quit and reopen the Claude desktop app

### Confirm the Connections

Start a new Claude conversation and type:

> "Check that your GitHub, Supabase, and Vercel connections are working."

Claude will verify each one and tell you if anything is missing or disconnected. If a connection fails, double-check the token you pasted for that service and make sure there are no extra spaces.

> ⚠️ Token expiry: your GitHub token will expire after 90 days. When it does, generate a new one at github.com/settings/tokens and update `claude_desktop_config.json` with the new value.

---

## You're Ready

With setup complete, all future work follows this pattern:

1. Tell Claude what you want to build or change
2. Claude works on a feature branch and shares a preview URL
3. You review the preview and confirm it looks right
4. You tell Claude to merge to production
5. Claude confirms the production deploy is live

You never need to touch the database directly, run code locally, or manage deployments manually.
