'use client'

// The design standard as live artifacts, not prose: every swatch, type step,
// and control below is the real token or real component rendered, so this
// page cannot describe something that no longer exists. The Preview row sets
// data-theme / data-density on the wrapper around every section (the scoped
// data-theme technique from docs/design-system.md), and every printed value
// is read back with getComputedStyle — never transcribed.
//
// Audience: a non-technical lead steering Claude Code by pointing at pieces
// by name. The deep technical reference stays docs/design-system.md.

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import DisclosureNote from '@/components/ui/DisclosureNote'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import IconButton from '@/components/ui/IconButton'
import StatTile from '@/components/ui/StatTile'
import StatusBadge from '@/components/ui/StatusBadge'
import TableCard from '@/components/ui/TableCard'

// ── Tokens shown (must exist in globals.css — nothing here is invented) ──

const GROUND_TOKENS = ['--primary-dark', '--primary', '--primary-light'] as const
const TINT_TOKENS = ['--primary-200', '--primary-100', '--primary-bg', '--page-bg', '--border'] as const
const INK_TOKENS = ['--text', '--muted', '--danger', '--warn-fg', '--success-fg'] as const
const FS_TOKENS = [
  ['--fs-display', 'Big dashboard number'],
  ['--fs-h1', 'Page title'],
  ['--fs-h2', 'Section heading'],
  ['--fs-body', 'Body copy and controls'],
  ['--fs-table', 'Table cells'],
  ['--fs-label', 'Field labels'],
  ['--fs-micro', 'Uppercase micro labels'],
] as const
const SPACE_TOKENS = ['--s1', '--s2', '--s3', '--s4', '--s5', '--s6', '--s7'] as const
const RADIUS_TOKENS = ['--r-sm', '--r-md', '--r-lg', '--r-pill'] as const
const SHADOW_TOKENS = ['--shadow-sm', '--shadow-md'] as const
const DENSITY_TOKENS = ['--ctl-h', '--ctl-h-sm', '--row-h'] as const
// The subset of the type scale that actually responds to density -- the
// ladder marks these so the Field preview has somewhere visible to land.
const DENSITY_FS = new Set(['--fs-body', '--fs-table', '--fs-label'])

const ALL_TOKENS: string[] = [
  ...GROUND_TOKENS, ...TINT_TOKENS, ...INK_TOKENS,
  ...FS_TOKENS.map(([t]) => t), ...SPACE_TOKENS, ...RADIUS_TOKENS, ...SHADOW_TOKENS,
  ...DENSITY_TOKENS,
]

// Reads each token's computed value off the preview wrapper, re-reading when
// the Preview toggles flip theme/density. Returns {} until mounted, so SSR
// prints '—' and never mismatches hydration.
function useTokenValues(ref: React.RefObject<HTMLDivElement | null>, theme: string, density: string) {
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!ref.current) return
    const cs = getComputedStyle(ref.current)
    const next: Record<string, string> = {}
    for (const t of ALL_TOKENS) next[t] = cs.getPropertyValue(t).trim()
    setValues(next)
  }, [ref, theme, density])
  return values
}

const MONO: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }

function TokenLabel({ token, value }: { token: string; value?: string }) {
  return (
    <div style={{ fontSize: 'var(--fs-micro)', lineHeight: 1.5 }}>
      <div style={{ ...MONO, color: 'var(--text)' }}>{token}</div>
      <div style={{ ...MONO, color: 'var(--muted)' }}>{value || '—'}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--muted)', marginTop: 12, marginBottom: 0 }}>{children}</p>
}

// ── Color ────────────────────────────────────────────────────────────────

function SwatchCard({ token, ink, asText, value }: {
  token: string
  ink?: string      // sample "Aa" ink rendered on the token as a ground
  asText?: boolean  // token is itself an ink: render it as text on a surface
  value?: string
}) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--surface-1)' }}>
      <div style={{
        height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: asText ? 'var(--surface-1)' : `var(${token})`,
        borderBottom: '1px solid var(--border-light)',
      }}>
        {(ink || asText) && (
          <span style={{ fontWeight: 600, color: asText ? `var(${token})` : `var(${ink})` }}>Aa</span>
        )}
      </div>
      <div style={{ padding: 'var(--s2)' }}>
        <TokenLabel token={token} value={value} />
      </div>
    </div>
  )
}

function SwatchRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--s3)' }}>
      <div style={{ fontSize: 'var(--fs-micro)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--s2)' }}>
        {children}
      </div>
    </div>
  )
}

// ── Component cards ──────────────────────────────────────────────────────

function ChipDemo() {
  const [scope, setScope] = useState('Week')
  const [on, setOn] = useState(true)
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {['Day', 'Week', 'Month'].map(s => (
          <Chip key={s} variant="scope" selected={scope === s} onSelect={() => setScope(s)}>{s}</Chip>
        ))}
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        <Chip variant="toggle" selected={on} onToggle={() => setOn(!on)}>Active only</Chip>
        <Chip variant="static" tone="primary">Current</Chip>
        <Chip variant="static" tone="info">Default</Chip>
        <Chip variant="static" tone="warn">Draft</Chip>
        <Chip variant="static" tone="neutral">Archived</Chip>
      </div>
    </div>
  )
}

function ComponentCard({ name, blurb, children }: { name: string; blurb: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--s3)', background: 'var(--surface-1)' }}>
      <div style={{ ...MONO, fontSize: 'var(--fs-label)', fontWeight: 600, marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 'var(--fs-label)', color: 'var(--muted)', marginBottom: 'var(--s3)' }}>{blurb}</div>
      {children}
    </div>
  )
}

// ── The guide ────────────────────────────────────────────────────────────

export default function DesignSystemGuide() {
  const [density, setDensity] = useState<'desk' | 'field'>('desk')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const wrapRef = useRef<HTMLDivElement>(null)
  const v = useTokenValues(wrapRef, theme, density)

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: 'var(--primary-bg)', border: '1px solid var(--primary-200)' }}>
        <p style={{ margin: 0 }}>
          What exists, how it fits together, and how to ask for a change. You don&apos;t need to write code to use
          this page — when asking Claude Code for changes, point at the pieces below by name and it knows the
          details. Everything here is the real thing rendered, not a picture of it.
        </p>
      </div>

      {/* Preview controls — set data-theme / data-density on the wrapper below */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 'var(--s4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>Preview</span>
          <div className="row" style={{ gap: 6 }}>
            {(['desk', 'field'] as const).map(d => (
              <Chip key={d} variant="scope" selected={density === d} onSelect={() => setDensity(d)}>
                {d === 'desk' ? 'Desk' : 'Field'}
              </Chip>
            ))}
          </div>
          <div className="row" style={{ gap: 6 }}>
            {(['light', 'dark'] as const).map(t => (
              <Chip key={t} variant="scope" selected={theme === t} onSelect={() => setTheme(t)}>
                {t === 'light' ? 'Light' : 'Dark'}
              </Chip>
            ))}
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--fs-label)', margin: '8px 0 0' }}>
          Values read from the stylesheet at render — nothing here is transcribed. On a phone the stylesheet forces
          Field-sized tap targets everywhere, so the Desk option is desk-only and may show no difference here.
        </p>
      </div>

      {/* Everything below lives inside the previewed theme + density. */}
      <div
        ref={wrapRef}
        data-theme={theme}
        data-density={density}
        style={{
          background: 'var(--page-bg)', color: 'var(--text)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 'var(--s4)',
        }}
      >
        {/* First thing inside the preview, so the Field/Desk toggle has an
            immediately visible landing spot -- density only changes the
            working sizes, which otherwise live below the fold. */}
        <Section title="Density in action">
          <div className="row" style={{ gap: 'var(--s4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Sample field" style={{ marginBottom: 0, minWidth: 200 }}>
              <input placeholder="Type here" readOnly />
            </Field>
            <Button variant="primary">Save changes</Button>
            <IconButton icon="edit" aria-label="Sample edit" size="lg" />
          </div>
          <Caption>
            Flip the Field preview above: controls grow from desk height to thumb height
            (<span style={MONO}>--ctl-h {v['--ctl-h'] || '—'}</span>) and the three working text sizes step up
            (<span style={MONO}>--fs-body {v['--fs-body'] || '—'}</span>, <span style={MONO}>--fs-table {v['--fs-table'] || '—'}</span>,{' '}
            <span style={MONO}>--fs-label {v['--fs-label'] || '—'}</span>). Headings, colors and spacing deliberately
            don&apos;t move — density is about tap targets and readability on a phone, not a second visual style.
            Each page declares one density, Desk or Field, and phones get Field-sized targets regardless.
          </Caption>
        </Section>

        <Section title="Color">
          <SwatchRow label="Brand grounds — light text on top">
            {GROUND_TOKENS.map(t => <SwatchCard key={t} token={t} ink="--on-primary" value={v[t]} />)}
          </SwatchRow>
          <SwatchRow label="Tints & surfaces — normal dark ink on top">
            {TINT_TOKENS.map(t => <SwatchCard key={t} token={t} ink="--text" value={v[t]} />)}
          </SwatchRow>
          <SwatchRow label="Inks — the text colors themselves">
            {INK_TOKENS.map(t => <SwatchCard key={t} token={t} asText value={v[t]} />)}
          </SwatchRow>
          <Caption>
            One palette, both themes — flip the Dark preview above and every value re-reads. The brand ramp lives in
            the fenced BRAND LAYER at the top of the stylesheet: rebranding for a client is swapping those few
            values, and everything here follows. A brand-new color is a change to the standard itself, not a
            page-by-page choice.
          </Caption>
        </Section>

        <Section title="Type ladder">
          <div className="stack" style={{ gap: 'var(--s2)' }}>
            {FS_TOKENS.map(([token, sample]) => (
              <div key={token} className="row" style={{ gap: 'var(--s4)', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: `var(${token})`, fontWeight: token === '--fs-display' || token === '--fs-h1' ? 700 : token === '--fs-h2' ? 600 : 400, minWidth: 0 }}>
                  {sample}
                </span>
                <span className="spacer" />
                <span style={{ ...MONO, fontSize: 'var(--fs-micro)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {token} · {v[token] || '—'}{DENSITY_FS.has(token) && ' · resizes with density'}
                </span>
              </div>
            ))}
            <div className="row" style={{ gap: 'var(--s4)', alignItems: 'baseline', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--s2)' }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-table)' }}>1,284.50</span>
              <span className="spacer" />
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--muted)' }}>
                tabular figures, right-aligned — every number column
              </span>
            </div>
          </div>
        </Section>

        <Section title="Space, radius, elevation">
          <div className="stack" style={{ gap: 6, marginBottom: 'var(--s4)' }}>
            {SPACE_TOKENS.map(t => (
              <div key={t} className="row" style={{ gap: 'var(--s3)', alignItems: 'center' }}>
                <span style={{ ...MONO, fontSize: 'var(--fs-micro)', color: 'var(--muted)', width: 88 }}>{t} · {v[t] || '—'}</span>
                <span style={{ display: 'inline-block', width: `var(${t})`, height: 10, background: 'var(--primary)', borderRadius: 'var(--r-sm)' }} />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 'var(--s4)', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 'var(--s4)' }}>
            {RADIUS_TOKENS.map(t => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{
                  width: t === '--r-pill' ? 88 : 48, height: t === '--r-pill' ? 30 : 48,
                  background: 'var(--primary-100)', border: '1px solid var(--primary-200)',
                  borderRadius: `var(${t})`, margin: '0 auto 6px',
                }} />
                <TokenLabel token={t} value={v[t]} />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 'var(--s4)', flexWrap: 'wrap' }}>
            {SHADOW_TOKENS.map(t => (
              <div key={t} style={{
                background: 'var(--surface-1)', boxShadow: `var(${t})`, border: '1px solid var(--border-light)',
                borderRadius: 'var(--r-lg)', padding: 'var(--s3)', maxWidth: 260,
              }}>
                <TokenLabel token={t} value={v[t]} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Components — rendered, not described">
          <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--s3)' }}>
            <ComponentCard name="Button" blurb="Every action everywhere — forms, review rows, admin pages. The busy label shows progress without the button jumping.">
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <Button variant="primary" size="sm">Save</Button>
                <Button size="sm">Cancel</Button>
                <Button variant="danger" size="sm">Reject</Button>
                <Button variant="ghost" size="sm">Restore</Button>
                <Button variant="link" size="sm">View all</Button>
                <Button variant="primary" size="sm" busy="Saving…">Save</Button>
              </div>
            </ComponentCard>

            <ComponentCard name="StatusBadge" blurb="Where a record stands in review, wherever a list shows one. Four tones only; a new status reuses the closest one.">
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <StatusBadge tone="pending">Pending</StatusBadge>
                <StatusBadge tone="approved">Approved</StatusBadge>
                <StatusBadge tone="rejected">Rejected</StatusBadge>
                <StatusBadge tone="neutral">Locked</StatusBadge>
              </div>
            </ComponentCard>

            <ComponentCard name="Chip" blurb="Quick pickers, filter toggles, and small static labels — view switchers, legends, the theme picker. Try the top row.">
              <ChipDemo />
            </ComponentCard>

            <ComponentCard name="Field" blurb="Every labeled form control, with the standard (optional) hint and the advisory / blocking message states.">
              <Field label="Email" optional notice="Advisory message — saves, but flags something worth knowing." style={{ marginBottom: 0, maxWidth: 240 }}>
                <input type="text" placeholder="e.g. name@example.com" />
              </Field>
            </ComponentCard>

            <ComponentCard name="IconButton" blurb="The ✎ pencil on rows and cards. Icons only for reversible, repeated edits — anything with consequences keeps its word.">
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <IconButton icon="edit" aria-label="Edit entry" />
                <IconButton icon="edit" aria-label="Edit entry" disabled title="Edit — desk only" />
                <span style={{ fontSize: 'var(--fs-label)', color: 'var(--muted)' }}>desk-only actions grey out on a phone, never hide</span>
              </div>
            </ComponentCard>

            <ComponentCard name="StatTile" blurb="Headline-number tiles for dashboard KPI rows. Tones reuse the same status palette as badges — no parallel colors.">
              <div className="row" style={{ gap: 'var(--s3)', flexWrap: 'wrap' }}>
                <StatTile label="Active records" value="1,284" sub="up 12 this week" />
                <StatTile label="Awaiting review" value="7" tone="warn" />
              </div>
            </ComponentCard>

            <ComponentCard name="EmptyState" blurb="What renders when there's nothing — a bare dash in a cell, a message row in a table, a bigger block on a page.">
              <div className="stack" style={{ gap: 'var(--s3)' }}>
                <div style={{ fontSize: 'var(--fs-table)' }}>Cell: <EmptyState scope="cell" /></div>
                <TableCard>
                  <table>
                    <thead><tr><th>Name</th><th data-num>Count</th></tr></thead>
                    <tbody>
                      <EmptyState scope="table" colSpan={2} message="No records match these filters." hint="Clear the filters to see everything." />
                    </tbody>
                  </table>
                </TableCard>
                <EmptyState scope="page" message="No records yet" hint="Records appear here once the first one is added." />
              </div>
            </ComponentCard>

            <ComponentCard name="DisclosureNote" blurb="The one-sentence policy bar above a table — the full rule unfolds on request.">
              <DisclosureNote summary="Records are archived, never deleted.">
                Archiving hides a record from day-to-day lists but keeps its history intact, and it can always be
                restored. Archiving asks for confirmation; restoring never does. The full pattern lives in
                docs/recipes/archiving-not-deleting.md.
              </DisclosureNote>
            </ComponentCard>
          </div>
          <Caption>
            One kit: every screen is assembled from these same blocks — new features reuse them, so the app stays
            consistent as it grows, and both themes and both densities come free with the shared pieces. The full
            registry (including ConfirmDialog, FilterBar, ExpandableRow and the rest) is COMPONENTS.md in the
            repository.
          </Caption>
        </Section>

        <Section title="Rules this page shows by example">
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Status tones are for review state only — a config flag that&apos;s off is never &ldquo;rejected.&rdquo;</li>
            <li>Pencil = reversible, repeated edit; words = consequences — Archive, Approve, Deactivate are never icons.</li>
            <li>Archive never deletes and always confirms, with real counts where history is at stake; restore never asks.</li>
            <li>Numbers are tabular and right-aligned — every count, quantity, and dollars column.</li>
            <li>One density per page, Desk or Field — never hand-picked sizes.</li>
            <li>On a phone: 44px touch targets and no sideways tables, whatever the page asked for.</li>
          </ul>
          <Caption>
            The cheapest requests point at something on this page by name: &ldquo;add an <strong>Approved</strong> badge
            to that list&rdquo; · &ldquo;make archiving this work like the archive rule above&rdquo; ·
            &ldquo;new page: a table like the one in EmptyState&apos;s card, but for customers.&rdquo; A brand-new color,
            size, or interaction is a change to the standard itself — worth a deliberate decision, not a side effect
            of one page.
          </Caption>
        </Section>
      </div>
    </div>
  )
}
