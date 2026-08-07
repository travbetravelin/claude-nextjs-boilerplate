# Component Registry

This file is the source of truth for all reusable UI components in this project.

**Before building anything new, check here first.** If a component exists or can be adapted, use it. Do not create a new component without updating this file.

---

## How to Use This Registry

- **Before building:** search this file for a component that covers the use case.
- **After building a new component:** add it here before ending the turn.
- **When adapting a component:** note the variant in the entry below.

---

## Components

The kit lives in `src/components/ui/`; app-level components in `src/components/`.
All styling comes from classes/tokens in `src/app/globals.css` — see
`docs/design-system.md` for the rules that govern usage.

### Button
- **File:** `src/components/ui/Button.tsx`
- **Purpose:** Every button in the app.
- **Props:** `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'` (default secondary), `size?: 'md' | 'sm'`, `busy?: string | false`, plus native button attributes.
- **Variants:** `busy` shows a working label ("Saving…") without the button shrinking below its resting width.
- **Usage example:** `<Button variant="primary" busy={saving && 'Saving…'} type="submit">Save</Button>`
- **Notes:** Labels are action verbs. Destructive actions pair with `ConfirmDialog` — a bare danger button is never enough.

### IconButton
- **File:** `src/components/ui/IconButton.tsx`
- **Purpose:** Icon-only button for **reversible, repeated row actions** (✎ edit).
- **Props:** `icon: 'edit'`, `aria-label` (required), `size?: 'sm' | 'lg'`.
- **Notes:** The icon-vs-word rule: any action with consequences (archive, approve, anything confirmed) always carries a word — never reduce it to an icon. Desk-only actions on mobile render greyed + disabled, never hidden.

### Chip
- **File:** `src/components/ui/Chip.tsx`
- **Purpose:** Filter toggles, scope/segmented switchers, static labeled values.
- **Props:** discriminated on `variant`: `scope` (`selected`, `onSelect`), `toggle` (`selected`, `onToggle`, renders ✕ affix when on), `static` (`tone`, plus `bg`/`fg`/`border` token escape hatches).
- **Notes:** Config booleans render as neutral static chips — never as StatusBadge tones.

### StatusBadge
- **File:** `src/components/ui/StatusBadge.tsx`
- **Purpose:** Any status pill.
- **Props:** `tone: 'pending' | 'approved' | 'rejected' | 'neutral'`, `title?`, `style?` (positioning only, never colors).
- **Notes:** Four tones only, deliberately — a fifth status reuses the closest existing tone. A badge palette that grows per status stops being scannable.

### ConfirmDialog
- **File:** `src/components/ui/ConfirmDialog.tsx`
- **Purpose:** Every "are you sure" flow.
- **Props:** `placement: 'inline' | 'card'`, `tone?: 'destructive' | 'neutral'`, `body?`, `warnings?` (blocking vs advisory), `loadImpact?: () => Promise<string>` (fetches a real impact count at confirm time), `confirmLabel`, `blockedReason?`, `extra?`, `onConfirm`, `onCancel`.
- **Notes:** Never a modal — the record being judged stays visible. `inline` replaces a row's own actions; `card` is full-width for wider warning content.

### EmptyState
- **File:** `src/components/ui/EmptyState.tsx`
- **Purpose:** Every "nothing here", at three scopes.
- **Props:** discriminated on `scope`: `cell` (bare "—"), `table` (`colSpan`, `message`, `hint?`), `page` (`message`, `hint?`, `action?`).
- **Notes:** Name the absent thing, not the container ("No entries match these filters", not "No data"); distinguish *empty* from *filtered-to-nothing*.

### Field
- **File:** `src/components/ui/Field.tsx`
- **Purpose:** A labeled form control (wraps `.form-group`).
- **Props:** `label` (ReactNode), `optional?`, `htmlFor?`, `warning?` (blocking, danger color), `notice?` (advisory, warn color), `style?`.
- **Notes:** Checkbox rows (label wraps the control) are the one labeled-control shape that stays hand-rolled.

### FilterBar
- **File:** `src/components/ui/FilterBar.tsx`
- **Purpose:** The filter-controls row above a table (wraps `.filter-bar`).
- **Props:** `children`.

### TableCard
- **File:** `src/components/ui/TableCard.tsx`
- **Purpose:** The card wrapping a `<table>` on a list page (wraps `.table-card`, provides horizontal scroll).
- **Props:** `children`, `style?`.

### NumberCell
- **File:** `src/components/ui/NumberCell.tsx`
- **Purpose:** A `<td>` holding numbers (hours, quantities, dollars) — right-aligned tabular figures via `data-num`.
- **Props:** native `<td>` attributes.
- **Notes:** Never set `textAlign` inline alongside it.

### Tabs
- **File:** `src/components/ui/Tabs.tsx`
- **Purpose:** Client tab switcher over server-rendered tab content.
- **Props:** `tabs: { key, label, content }[]`, `initial?`.
- **Notes:** Content toggles with `display: none`, not conditional unmount — switching tabs must not re-scroll or re-fetch.

### ExpandableRow
- **File:** `src/components/ui/ExpandableRow.tsx`
- **Purpose:** A table row with a drill-down detail panel.
- **Props:** `expanded`, `colSpan`, `cells`, `detail`, `rowClassName?`, `rowStyle?`.
- **Notes:** One row open at a time — the caller owns `expanded`.

### DisclosureNote
- **File:** `src/components/ui/DisclosureNote.tsx`
- **Purpose:** A collapsed policy/integrity note above a table — the key sentence shows, the full rule expands.
- **Props:** `summary`, `tone?: 'neutral' | 'warning'`, `defaultOpen?`, `children`.

### StatTile
- **File:** `src/components/ui/StatTile.tsx`
- **Purpose:** A single stat with label, value, and optional secondary line.
- **Props:** `label`, `value`, `sub?`, `tone?: 'neutral' | 'success' | 'warn' | 'danger'`.

### StagingBanner
- **File:** `src/components/StagingBanner.tsx`
- **Purpose:** Full-width "STAGING ENVIRONMENT" banner when `NEXT_PUBLIC_APP_ENV=staging`.
- **Notes:** Colored by `--staging-header-bg`. The trigger condition must stay the same (see CLAUDE.md's Staging Indicator section).

### ThemeToggle
- **File:** `src/components/ThemeToggle.tsx`
- **Purpose:** Three-way Light / Dark / System theme picker card.
- **Notes:** Reads/writes via `src/lib/theme.ts`; the storage key is duplicated in `src/app/layout.tsx`'s pre-paint script — keep them in sync.

### SignOutButton
- **File:** `src/components/SignOutButton.tsx`
- **Purpose:** Signs out via Supabase and returns to `/login`.

---

## Entry Format

```
### ComponentName
- **File:** `src/components/ComponentName.tsx`
- **Purpose:** One sentence describing what it does.
- **Props:** List key props and their types.
- **Variants:** Any visual or behavioral variants (e.g. size, color, state).
- **Usage example:**
  ```tsx
  <ComponentName prop="value" />
  ```
- **Notes:** Any constraints, known limitations, or usage rules.
```
