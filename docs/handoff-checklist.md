# Client Handoff Checklist

Use this when transferring an app built from this template to a client who
will own it — including clients who will keep developing it through Claude
Code sessions of their own. Work through it top to bottom; every item is
something that breaks later if it's skipped now.

## 1. Account ownership

- [ ] **GitHub repo** transferred to the client's GitHub account/org
      (Settings → General → Transfer ownership), or the client added as
      admin if you retain the org.
- [ ] **Vercel project** transferred to the client's Vercel team
      (Project Settings → General → Transfer), and billing on their card.
- [ ] **Supabase projects** (staging + production) transferred to the
      client's Supabase organization, and billing on their card.
- [ ] Custom **domain** registered in an account the client controls, DNS
      pointed at Vercel from that account.

## 2. Secrets & tokens

Every token created under *your* accounts stops working when access changes.
Recreate each under the client's accounts and update where it's stored:

- [ ] `VERCEL_TOKEN` — new token from the client's Vercel account, for
      their Claude MCP connection (deploys themselves need no token —
      Vercel's git integration handles them).
- [ ] `SUPABASE_ACCESS_TOKEN` — new token from the client's Supabase
      account → GitHub Actions secrets.
- [ ] Confirm Vercel's git integration still points at the transferred
      GitHub repo (Project Settings → Git) — the connection can drop when
      the repo or project changes owners.
- [ ] Confirm all `*_SUPABASE_*` secrets and Vercel environment variables
      still point at the transferred projects.
- [ ] Client has stored the Supabase **database passwords** somewhere safe
      that isn't this repo.

## 3. Safety rails for a self-serve owner

- [ ] Branch protection on `main`: preview checks required before merge
      (GitHub Settings → Branches).
- [ ] Client knows the rollback move: Vercel Dashboard → Deployments →
      last working deployment → Redeploy.
- [ ] Client knows database rollbacks live in `supabase/migrations/rollbacks/`
      and are run by hand via the Supabase SQL editor.
- [ ] Walk the client through one full cycle: ask Claude for a small change →
      review the preview URL → approve the merge → see it in production.

## 4. Verify after transfer

- [ ] Push a trivial change on a feature branch → preview workflow goes
      green and a preview URL deploys.
- [ ] Merge to `main` → deploy workflow goes green, production updates.
- [ ] Log in to the production app as a normal user.
- [ ] Send a password reset email and confirm it arrives (email settings
      can silently break during Supabase transfers).
