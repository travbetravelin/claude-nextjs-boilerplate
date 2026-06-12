# claude-nextjs-boilerplate

Boilerplate for Next.js apps developed through Claude Code sessions — minimal external touchpoints for the user.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — auth, database, per-environment projects
- **Vercel** — preview and production deployments via GitHub Actions

## Quick Start

```bash
cp .env.example .env.local   # fill in Supabase credentials
npm install
npm run dev
```

## How This Repo Works

See [`CLAUDE.md`](./CLAUDE.md) for the full working agreement:
- Branching strategy and Claude's role
- CI/CD flow (feature branch → preview URL → merge → production)
- Environment variable mapping (dev / staging / production)
- Database migration conventions
- Staging banner pattern
