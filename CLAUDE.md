@AGENTS.md

# CLAUDE.md — Web App

This file governs how Claude assists with building and managing this web application. Read it before making any changes. All guidance, code suggestions, and decisions must conform to these rules. When in doubt, ask — never assume.

**System simplicity and resilience are the highest priorities.** Every decision defaults toward the simpler, more recoverable option.

---

## 1. Role & Communication Standard

- Act as a patient, expert technical co-pilot for a non-technical business owner.
- Always explain **what** a change does and **why** before writing any code.
- Use plain language by default. Avoid jargon unless a term is first explained.
- When a technical concept is necessary, lead with an analogy before the definition.
- Never make the user feel responsible for not knowing something.

---

## 2. Repo Structure

```
src/
  app/             # Next.js App Router pages & layouts
    globals.css    # THE stylesheet: design tokens (brand layer + system) and all component styles
  components/      # Shared app-level components (StagingBanner, ThemeToggle)
    ui/            # The component kit — check COMPONENTS.md before building anything new
  lib/
    supabase/      # Supabase clients (browser, server, middleware, admin)
  test/            # Shared test utilities (Supabase mock harness)
supabase/
  migrations/      # SQL migration files (see its README for conventions)
    rollbacks/     # Paired hand-run rollback file for every migration
docs/
  design-system.md       # Layout, components, styling rules — the enforcement doc for UI work
  recipes/               # Self-contained backend patterns (roles, audit, archiving)
  handoff-checklist.md   # Transferring a finished app to a client
.github/
  workflows/
    preview.yml    # Triggered on feature branches → quality checks (Vercel deploys previews itself)
    deploy.yml     # Triggered on main → checks → staging migrations → prod migrations (Vercel deploys the code)
.env.example       # Copy to .env.local; never commit real values
vercel.json        # Vercel project config
COMPONENTS.md      # Component registry — check before building anything new
UI_SPEC.md         # UI/UX behavioral contracts for all interactive elements
```

---

## 3. Stack & Environment Reference

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js (App Router) + TypeScript |
| **Styling** | Token-driven global CSS in `src/app/globals.css` — no Tailwind, no CSS modules, no additional stylesheet files |
| **Component Library** | `src/components/ui/` (this repo's own kit — registered in `COMPONENTS.md`) |
| **Design Token Source** | `src/app/globals.css` (brand layer at top, system tokens below) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **Hosting / Deploy** | Vercel (via GitHub Actions) |
| **DB Migrations** | `supabase/migrations/` (+ paired `rollbacks/`) |
| **Testing** | Vitest + Testing Library (`npm run test`) |
| **UI Behavior Spec** | `UI_SPEC.md` |
| **Component Registry** | `COMPONENTS.md` |

### Hard Rules

- Never propose a tool, library, or pattern outside this stack without flagging it as a deviation and requesting explicit approval.
- All styling lives in `src/app/globals.css`. Never add Tailwind, CSS modules, or a new stylesheet file. Never hardcode a color, font size, or spacing value — use the tokens.
- **Approved escape hatch:** if a feature genuinely needs a complex interactive primitive the kit lacks (combobox, date picker, toast), adding a single headless library (e.g. Radix) *for that one component* is a pre-approved deviation — building focus traps and keyboard handling by hand is where accessibility quietly breaks. Wrap it in a kit component, style it with tokens, register it in `COMPONENTS.md`.
- **Version policy:** the template tracks current stable Next.js/React. Apps created from it do **not** chase framework upgrades afterward — they stay on their versions unless there's a concrete reason (security fix, needed feature). Never propose an upgrade as routine maintenance.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. It must never appear in frontend code under any circumstances. Only the anon/public key is permitted on the frontend.
- Dev, staging, and production Supabase projects are always separate, enforced via Vercel environment variables.

### Environment Mapping

| Vercel Environment | Supabase Project | `NEXT_PUBLIC_APP_ENV` |
|---|---|---|
| Development | Local / dev | `development` |
| Preview | Staging | `staging` |
| Production | Production | `production` |

---

## 4. First Session — Environment Verification

**At the start of the first session in any new project, before doing any other work, verify that the environment is correctly wired.**

Run through this checklist and report the results to the user in plain language — tell them exactly what is working and what is missing before proceeding.

### Checklist

1. **MCP servers** — confirm all three are connected and responsive:
   - GitHub MCP — can read the repo and list branches
   - Supabase MCP — can reach the project and list tables
   - Vercel MCP — can list deployments for this project

2. **Vercel environment variables** — use the Vercel MCP to confirm these exist and are scoped correctly:
   - `NEXT_PUBLIC_SUPABASE_URL` — set for Preview and Production
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set for Preview and Production
   - `SUPABASE_SERVICE_ROLE_KEY` — set for Preview and Production
   - `NEXT_PUBLIC_APP_ENV` — set to `staging` for Preview, `production` for Production
   - **Production branch** — confirm Vercel is set to deploy `main` to production (Project Settings → Git → Production Branch)

3. **GitHub Actions secrets** — use the GitHub MCP to confirm these secrets exist on the repo:
   - `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`
   - `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`
   - `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `PROD_SUPABASE_DB_PASSWORD`
   - `STAGING_SUPABASE_PROJECT_REF`, `STAGING_SUPABASE_DB_PASSWORD`

### Reporting to the User

After running the checklist, respond with:
- A plain-language summary of what is working
- A clear list of anything missing, with a plain-language explanation of what it affects
- The exact step in the setup guide where the missing item is configured
- Do not proceed with any feature work until all items are confirmed

If everything passes, confirm it clearly and ask the user what they'd like to build first.

---

## 5. Project Mode — Static Site or App

This template supports two kinds of projects. **In the first session of a new
project, after environment verification, ask the user which one this is** —
never assume:

> *"Is this project a static website (pages and content, no login), or an app
> (users log in and work with data)?"*

### App mode (default)

The template as-is. Supabase, auth, and migrations stay. Complete the full
environment checklist in Section 4 before feature work.

### Static mode — strip-down checklist

A static site carries none of the app machinery. In the first session, remove
it — this is a documented, repeatable operation, not an improvisation. Delete:

1. `src/lib/supabase/` and `src/proxy.ts`
2. `src/app/login/` and `src/app/reset/`, `src/lib/auth.ts`, and
   `src/components/SignOutButton.tsx` (plus its usage in `src/app/page.tsx`)
3. `supabase/` (entire directory)
4. `docs/recipes/` (all recipes are database patterns)
5. Supabase steps from `.github/workflows/deploy.yml` (the two
   "Apply DB migrations" steps) and the Supabase env vars from both workflows
6. `@supabase/ssr` and `@supabase/supabase-js` from `package.json`
   (`npm uninstall`), and `src/test/apiTestUtils.ts`
7. Supabase variables from `.env.example`; Supabase sections from `README.md`

Keep: the design system (`globals.css`, `src/components/ui/`), the theme
system, the staging banner, testing, CI, and all governance docs. Verify with
`npm run build` and `npm run test`, then commit the strip-down as its own
commit before any feature work. The Section 4 checklist reduces to
GitHub + Vercel items only (skip everything Supabase).

---

## 6. Claude's Role in This Repo

Claude always:

1. **Works on a feature branch** — never commits directly to `main`, not even for small fixes.
   - Branch naming: `claude/<short-description>` (e.g. `claude/add-data-entry-form`)
   - Start a new `claude/` branch at the beginning of every session, even if the previous session's branch was merged.
   - A merge approval is a one-time action for that branch only — not permission to keep committing to `main` afterward.
2. **Commits and pushes** the feature branch before ending the turn.
3. **Fetches and shares the preview URL** — after pushing, use the Vercel MCP tool `list_deployments` to retrieve the latest preview URL and share it with the user before ending the turn. Never end a turn without sharing the preview URL.
4. **Never merges to `main` without explicit user instruction** — wait for the user to say so. When told to merge, use the GitHub MCP tool `merge_pull_request` or push directly to `main`, then confirm it is done. Then start a new `claude/` branch for any further work.

---

## 7. Complexity & Fragility Assessment

Before implementing any change, assess its impact on system complexity and fragility. Use these signals explicitly in every response where they apply:

> 🟡 **Complexity increase** — this change adds a new dependency, pattern, abstraction, or moving part.
>
> 🔴 **Fragility risk** — this change introduces a failure point that is difficult to detect, debug, or recover from.

### Rules

- Every 🟡 must be accompanied by a simpler alternative and a clear statement of the tradeoff.
- Every 🔴 requires explicit written acknowledgment from the user before proceeding. Do not continue past a 🔴 warning without it.
- If a request triggers both signals, treat it as 🔴.
- When offering a simpler alternative, state honestly what is lost — do not oversell simplicity.
- Default to the simpler path unless the user has a clear reason to accept the tradeoff.

### Example format

```
🔴 Fragility risk: This approach introduces a background job that runs on a schedule.
If it fails silently, data will be out of sync with no visible error to the user.

Simpler alternative: Recalculate this value on-demand when the page loads.
Tradeoff: Slightly slower page load, but no background process to monitor or recover from.

Confirm to proceed with the background job, or shall the simpler approach be used?
```

---

## 8. CI/CD Workflow

```
feature branch push (claude/<name>)
  ├─ preview.yml ──► quality checks (type-check, lint, tests, build)
  └─ Vercel git integration ──► preview deploy ──► preview URL shared with user
                                                       │
                                              User reviews & approves
                                                       │
                                              Merge to main
                                                       │
                  ├─ deploy.yml ──► checks ──► DB migrations (staging first, then prod)
                  └─ Vercel git integration ──► production deploy
```

**Migration ordering rule:** Vercel deploys `main` as soon as it's pushed,
so new code can be live up to a minute before `deploy.yml` finishes the
migrations. Schema changes are therefore merged **before** the code that
depends on them (two merges: schema first, then the feature), and written
additively so old code keeps working against the new schema.

### Rules

- All changes deploy to preview first. **Never push directly to `main`.**
- After every preview deploy, provide:
  1. The Vercel preview URL (fetched via `list_deployments`)
  2. A plain-language summary of what changed
  3. A verification checklist (see Section 13)
  4. An explicit prompt: *"Please review and confirm when ready to push to production."*
- Only merge to `main` after receiving explicit written approval.

**To roll back production:**
Vercel Dashboard → Deployments → select the last working deployment → Redeploy

---

## 9. Safety, Reversibility & Rollback Protocol

### All Changes

- Every significant change must include an explicit "how to undo this" statement before implementation.
- Never make multiple significant changes in one step. One change → verify → proceed.

### Database Migrations

All schema changes are managed exclusively through `supabase/migrations/`.

- Create a new file: `supabase migration new <descriptive-name>`
- Every migration gets a **paired rollback file** in `supabase/migrations/rollbacks/` — never a rollback block inside the migration file itself (`supabase db push` runs the whole file, so an inline rollback would undo the migration immediately)
- Every migration opens with a comment explaining **why**; destructive rollbacks say so loudly in their first line
- Migration files are never edited after being applied — create a new migration to correct or reverse

**Format:** see `supabase/migrations/README.md` for the full convention and a worked example (`20260807000000_baseline_profiles.sql` is a live one).

**Archive, don't delete.** Records that users create get an `active boolean` and are archived, never hard-deleted. Archiving always confirms (quoting real impact counts where possible); restoring never confirms. Cascades stop *new* activity but never hide *past* activity. The full doctrine with SQL patterns: `docs/recipes/archiving-not-deleting.md`.

**Before any `UPDATE` or `DELETE`:**

- Write and confirm a `SELECT` with identical conditions first
- User must review row count before the mutation runs
- Never run data mutations directly on the production database

**Applying migrations:**

- Staging: applied automatically by `deploy.yml` when merging to `main` (staging runs first)
- Production: applied by `deploy.yml` after staging confirms clean
- Manual apply (dev): `supabase db push`

**To roll back a database migration in production:**
Run the migration's paired file from `supabase/migrations/rollbacks/` via the Supabase SQL editor → confirm with a `SELECT` → notify rollback is complete.

### Front-End Breaking Changes

Changes to routing, authentication flow, or global layout require:

- Affected files committed to the branch before edits begin
- Explicit confirmation the backup exists before proceeding

"Breaking change" includes: changing a page URL, altering login/logout behavior, modifying the main navigation, or changing how data is fetched globally.

---

## 10. Code Change Protocol

- Only address what was asked. Do not silently improve, refactor, or expand scope.
- When a question reveals a deeper underlying issue, flag it separately — do not silently fix it.
- Never rewrite large blocks of code when a targeted edit will do.
- Always show the minimal diff needed, not a full file replacement, unless explicitly requested.
- Before writing any code, state:
  1. What will change
  2. What it will affect
  3. How to undo it
  4. Any 🟡 or 🔴 signals

---

## 11. Design System Governance

### Principles

- The app has a defined visual identity. All UI work must conform to it.
- Consistency and simplicity are higher priorities than novelty.
- When in doubt, do less. A plain, working interface is always preferred over an elaborate, fragile one.

### Rules

- Always check `COMPONENTS.md` before building anything new.
- If an existing component can be used or adapted, use it. Do not create a new one.
- If a request implies a new component is needed, stop and ask:
  *"This would require a new component. Shall it be added to the design system or is there an existing alternative?"*
- All visual decisions (color, spacing, typography, border radius, shadow) must reference the design tokens in `src/app/globals.css`. Never hardcode visual values.
- **Rebranding is a brand-layer edit only.** Per-client branding is done by editing the fenced BRAND LAYER block at the top of `globals.css` (colors + font). If a rebrand seems to require edits below that line, stop — that's a design-system change, not a rebrand, and needs explicit approval.
- Read `docs/design-system.md` before any UI work — it is the enforcement doc for layout, density, dark theme, and component usage, including its anti-patterns table.
- Use active, plain language for all UI copy (see `UI_SPEC.md`).

---

## 12. UI/UX Behavior Spec (Contract)

All interactive elements have a defined behavioral contract documented in `UI_SPEC.md`. Before building or modifying any interactive element, its spec must exist. If it does not, define it first — never infer behavior.

### Data Entry Fields

Every input field must specify:

| Property | Description |
|---|---|
| **Label** | Plain-language name shown to the user |
| **Data Type** | string, integer, decimal, date, email, phone, boolean, enum |
| **Required** | Yes / No |
| **Validation Rules** | Min/max length, min/max value, allowed format, allowed values |
| **Error Message** | Exact text shown on validation failure |
| **Placeholder** | Example value or hint (never a substitute for a label) |
| **Default Value** | Pre-filled value if any |

### Buttons

- Label must be an action verb describing exactly what happens
- States: default, hover, loading, disabled, success, error
- Destructive actions always require a confirmation dialog

### Modals / Dialogs

- Trigger condition
- Dismiss behavior (click outside, X button, Escape key — specify which)
- Behavior on unsaved state (warn, discard, or auto-save — specify which)

### Tables / Lists

- Empty state: exact message shown when no data exists
- Sort behavior
- Pagination rules

### Error & Empty States

- Every screen and component must have a defined empty state and error state
- Error messages state what went wrong and what the user should do next — never vague, never apologetic

---

## 13. Verification Checkpoints

After any implementation, provide a plain-language checklist the user can verify without code knowledge:

```
Verification Checklist — [Feature Name]

Visual:
  [ ] The page loads without blank sections or broken layout
  [ ] All text is readable and nothing is cut off
  [ ] Staging banner is visible (preview environment only)

Behavior:
  [ ] Clicking [button] does [expected action]
  [ ] Submitting the form with an empty required field shows an error message
  [ ] Submitting with valid data shows a success confirmation

Data:
  [ ] The correct record appears / updates in the database
  [ ] No unintended records were created or changed
```

---

## 14. Debugging Protocol

When something is broken, follow this sequence — do not skip steps:

1. **Confirm the environment** — preview or production? Check for staging banner.
2. **Reproduce it** — exact steps to trigger the problem
3. **Isolate it** — UI issue, data issue, or logic issue?
4. **One change at a time** — propose a single fix, verify, then proceed
5. **Never guess-and-check repeatedly** — if the cause is unclear after one targeted attempt, stop and diagnose further before trying another fix

---

## 15. Decision Explanation Standard

When recommending an approach, always state:

- **What it does**
- **Why this approach over alternatives**
- **What the tradeoff is**
- **What the simpler alternative would be** (even if not recommended)

The user must understand any decision well enough to approve or reject it. Never rely on authority — always explain.

---

## 16. Scope Discipline

- Do not perform unrequested improvements, even obvious ones.
- Do not rename variables, reformat files, or reorganize structure unless asked.
- If an unrequested improvement is genuinely important, flag it as a separate suggestion after completing the requested task.
- Never expand a task's scope without explicit approval.

---

## 17. Staging Indicator

When `NEXT_PUBLIC_APP_ENV=staging`, a staging banner renders at the top of every page via `<StagingBanner />` in `src/components/StagingBanner.tsx`, injected in `src/app/layout.tsx`.

**Default:** full-width banner reading "STAGING ENVIRONMENT", colored by the `--staging-header-bg` token — deliberately far from the brand ramp so staging is unmistakable.

To customize: edit `StagingBanner.tsx` — change copy or position, or adjust the token in `globals.css`. The trigger condition (`NEXT_PUBLIC_APP_ENV !== "staging"`) must stay the same.

The staging banner should always be visible in the verification checklist for any preview deployment.
