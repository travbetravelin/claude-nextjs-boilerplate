# Design System

Read this before making any UI change. It tells you what already exists so a
new page or feature reaches for it instead of reinventing it. Schema and
business-logic conventions live in `CLAUDE.md` and `docs/recipes/` — this doc
is scoped to layout, components, and styling.

## Core rules

1. **One stylesheet, no exceptions.** All styling is in `src/app/globals.css`
   — no Tailwind, no CSS modules, no component-level `.css` files. A new
   component gets new classes/rules added to `globals.css`, not a sibling
   stylesheet.
2. **Tokens over literals.** Every color, size, and spacing value that
   repeats — or that carries semantic meaning (a status, a surface, a brand
   tint) — is a CSS custom property, not a hex code or a bare `px` sprinkled
   into a `style={{}}`. See "Design tokens" below before typing a hex value
   anywhere.
3. **Rebrand = brand layer only.** Per-client branding is done by editing the
   fenced BRAND LAYER block at the top of `globals.css` (brand color ramp +
   font) and the two hand-synced theme-color hexes it points at. If a rebrand
   seems to need edits below that fence, stop — that's a design-system
   change, not a rebrand.
4. **Two densities, not two codebases.** A page is either **Field**
   (`data-density="field"`: touch-first — login, dashboards used on phones)
   or **Desk** (default: dense admin tables). Same components, same CSS — the
   density attribute changes control heights, row heights, and font sizes via
   token overrides. A new page declares one of the two on its `<main>`;
   never hand-picks its own sizes. Phones always get Field-sized tap targets
   regardless of declared density (a 30px control is a mis-tap magnet).
5. **Reach for an existing component first.** Check `COMPONENTS.md` — most
   list-page and form patterns already have a shared piece.
6. **Nothing invented.** If a design decision (a new color, radius, spacing
   value) doesn't map to something already in the token set, that's a signal
   to ask whether it should be — not to drop a one-off literal into a
   component.

## Design tokens

All defined in `globals.css`'s `:root` block, remapped under
`[data-theme="dark"]`. Reference the token, never the hex value.

### Color

| Group | Tokens | Notes |
|---|---|---|
| Brand ramp (BRAND LAYER) | `--primary`, `--primary-dark`, `--primary-light`, `--primary-bg`, `--primary-100`, `--primary-200`, `--primary-darker` | `--primary-dark` is a **ground only** (header, thead/tfoot bands) — for emphasis text on a tint, use `--primary-emphasis`. |
| Text-on-brand | `--primary-emphasis` | Splits off `--primary-dark` for text use: equal to it in light mode, lighter in dark mode. A token can't be both a dark ground *and* readable text once dark theme darkens the ground further. |
| Ink on brand | `--on-primary`, `--nav-ink` | Text/icon ink on brand grounds (header, `.btn-primary`, thead bands). Never write the `white` literal for these. |
| Brand tints | `--primary-tint`, `--primary-tint-strong` | Highlight washes ("my row", selected states), derived from `--primary` via `color-mix` so a rebrand and dark theme both follow automatically — never hand-roll an `rgba()` of the brand hue. |
| Environment | `--staging-header-bg` | Staging banner/badge color — deliberately far from the brand ramp so staging is unmistakable. |
| Neutrals | `--text`, `--text-cell`, `--muted`, `--muted-light`, `--border`, `--border-light`, `--border-strong` | `--muted-light` is for "(optional)" hints. `--border-strong` is for structural table rules and empty-cell "—" placeholders (`EmptyState scope="cell"`). |
| Surfaces | `--page-bg`, `--surface-0/1/2`, `--row-hover` | `--surface-1` is the standard card/input background (`white` in light mode) — use it instead of the literal `white`, or dark theme will leave a bright white patch. `--surface-2` is one step up (zebra stripes, hover). |
| Status | `--danger(-bg/-fg/-border)`, `--success(-bg/-fg/-border)`, `--warn-bg/-fg`, `--warn-alert-bg/-border`, `--warn-accent`, `--neutral-bg/-fg` | The `-bg/-fg` pairs back `StatusBadge` and `.alert-*`. `--warn-alert-*` is the wider advisory-paragraph shade (ConfirmDialog cards), distinct from the compact badge amber. `--warn-accent` is standalone accent text, never paired with a background. **Red is reserved for errors and critical conditions**: trigger buttons for consequential-but-routine actions (Archive, Deactivate) render plain or primary — red appears at the confirmation step, on blocking warnings, on error states, and on genuinely critical numbers. A Reject that pairs with an Approve keeps red as its negative. Incomplete-setup attention states use the warn ramp, not danger. |

**Adding a new color token:** add it to `:root` *and* its
`[data-theme="dark"]` counterpart in the same change — a token with no dark
override silently stays light-mode-colored under dark theme. If the new
color is genuinely a one-off (used exactly once, no semantic name), leave it
as a literal — but check it still reads in dark mode.

### Type, space, radius, elevation

```
--fs-display / -h1 / -h2 / -body / -table / -label / -micro   (type scale)
--s1 … --s7                                                    (4px-base spacing)
--r-sm / -md / -lg / -pill                                     (radius)
--shadow-sm / -md                                              (cards vs. popovers)
```

Numeric cells (hours, quantities, dollars) get a bare `data-num` attribute
on the `td`/`th` — tabular figures and right-alignment both come from the
`[data-num]` rule. `NumberCell` wraps this for JSX call sites. Don't set
`textAlign` inline alongside it.

### Density

```
--ctl-h, --ctl-h-sm, --row-h, --cell-y, --cell-x
```

Defaults in `:root` are Desk's; `[data-density="field"]` overrides them,
and a `@media (max-width: 720px)` rule forces Field-sized targets on phones
regardless of declared density.

## Dark theme

Mechanism: `[data-theme="dark"]` on `<html>`, set by a blocking inline
script in `src/app/layout.tsx` (reads `localStorage['app-theme']` before
first paint to avoid a flash) and by `src/lib/theme.ts`'s `setThemeMode()`
when the user changes it via `ThemeToggle`. "System" is resolved to an
explicit light/dark in JS — there is no `@media (prefers-color-scheme)` CSS
block, so there's exactly one CSS mechanism to reason about. Light values
are also attached to `[data-theme="light"]` so a light island can be scoped
inside a dark subtree.

**Rules for anything you add:**
- Never write a raw hex/`rgb()`/`white` literal for a color with semantic
  meaning or that appears more than once — it will look right in light mode
  and wrong (or invisible) in dark.
- A token used as both a **ground** and a **foreground** somewhere is a bug
  waiting to happen under dark theme — split it (see `--primary-emphasis`)
  rather than remapping the single token.
- The storage key and theme-color hexes are hand-synced between
  `lib/theme.ts` and `layout.tsx`'s inline script — change them together.

## Page patterns

**Shell.** `<main className="page">` (or `page-wide` for admin tables that
need the width) + a density attribute. Pre-auth pages (`/login`, `/reset`)
use the shared `LoginShell` — same `.page`, Field density, no nav.

**Server data, client mutation.** Server components fetch with
`lib/supabase/server.ts` and pass data down; anything that mutates is a
`'use client'` component using the browser client. Privileged writes go
through server actions or route handlers using `lib/supabase/admin.ts` —
never expose the service key toward the client.

**Auth gates.** Pages call `requireUser()` / `requireRole()` from
`src/lib/auth.ts` at the top; server actions use `requireRoleAction()`
(throws instead of redirecting — an action's caller needs an error to
surface, not a navigation).

**Tabs.** Server-render each tab's content, pass all of them into `Tabs`,
which toggles visibility with `display: none` — not conditional
unmount/remount, which re-scrolls and re-fetches on every switch.

**Archiving.** Admin-managed records use `active boolean`, never hard
delete. Archive always confirms first (via `ConfirmDialog`, quoting a real
impact count where possible); restore never does. Full doctrine:
`docs/recipes/archiving-not-deleting.md`.

## Checklist before shipping a UI change

- [ ] Does an existing component in `src/components/ui/` already do this
      shape? (list row, badge, confirm flow, empty state, filter bar…)
- [ ] Every color used is a token, or is a genuine one-off that still reads
      in dark mode.
- [ ] The page declares `data-density="field"` or uses the Desk default —
      not a bespoke set of sizes.
- [ ] Numeric cells carry `data-num` (or use `NumberCell`).
- [ ] Any destructive action goes through `ConfirmDialog` (or
      `ArchiveButton` for archive/restore), not a bare `confirm()` or an
      immediate mutation.
- [ ] No red trigger buttons for routine actions — red belongs to the
      confirm step, blocking warnings, and errors.
- [ ] Tables use `TableCard` and get sticky headers for free — opt out with
      `stickyHeader={false}` only where internal scroll is genuinely wrong.
- [ ] If you added a new color token, it has both a `:root` value and a
      `[data-theme="dark"]` override in the same change.

## Anti-patterns

| Don't | Do instead |
|---|---|
| A new `.css`/`.module.css` file, or a Tailwind class | Add rules to `globals.css`, using existing tokens |
| `background: 'white'` / `color: '#374151'` inline | `var(--surface-1)` / `var(--text-cell)` |
| A bespoke status pill with its own colors | `StatusBadge` with the closest of the four tones |
| `window.confirm(...)` before a destructive action | `ConfirmDialog` (or `ArchiveButton` for archive/restore) |
| A red Archive/Deactivate trigger button | Plain/secondary trigger — red appears at the confirm step |
| Conditional unmount to switch tabs | `display: none` toggling on pre-rendered content (`Tabs`) |
| A hand-picked control height / font size for a "denser" page | The Desk default, or `data-density="field"` |
| `color: var(--primary-dark)` for text on a tinted background | `color: var(--primary-emphasis)` |
| Editing system-layer tokens for a rebrand | Edit only the fenced BRAND LAYER block |
