'use client'

import { useEffect, useState } from 'react'
import Button from './Button'

// Every destructive action confirms through this component -- no bare
// window.confirm, no delete-on-first-click.
//
// Two placements, never modal. `inline` replaces a row's own action in
// place -- nothing moves except that row. `card` is a full-width block with
// a --danger left rule, used when the warnings need the width. Both keep
// the record being judged visible; a scrim would hide exactly that.
//
// The caller owns whether this is mounted at all -- there is no trigger
// here, just the confirming state once a row/page has already decided to
// show it. Cancel is the caller's job to unmount (onCancel).
export interface ConfirmWarning {
  severity: 'blocking' | 'advisory'
  content: React.ReactNode
}

interface Props {
  placement: 'inline' | 'card'
  // destructive gives the confirm button the danger variant; neutral is for
  // reversible things (Restore, reopen) where red would overstate the
  // stakes.
  tone?: 'destructive' | 'neutral'
  title?: string // card only
  body?: React.ReactNode
  warnings?: ConfirmWarning[]
  // Called once confirming mounts; renders "Checking…" until it resolves.
  loadImpact?: () => Promise<string>
  confirmLabel: string
  cancelLabel?: string
  // Short text shown beside the confirm button when blocked -- a disabled
  // button with no visible explanation is a dead end, and a title
  // attribute alone isn't enough of one.
  blockedReason?: string
  // Native title attribute on the confirm button (card placement's own
  // extra affordance -- kept alongside blockedReason rather than instead
  // of it).
  confirmTitle?: string
  // Extra content rendered after the warning boxes, before the buttons --
  // a deep link to go resolve what's blocking, a run-time error from a
  // failed confirm. Card placement only.
  extra?: React.ReactNode
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function ConfirmDialog({
  placement,
  tone = 'destructive',
  title,
  body,
  warnings = [],
  loadImpact,
  confirmLabel,
  cancelLabel = 'Cancel',
  blockedReason,
  confirmTitle,
  extra,
  onConfirm,
  onCancel,
}: Props) {
  const [checking, setChecking] = useState(!!loadImpact)
  const [impact, setImpact] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (loadImpact) {
      // checking already initialized to true when loadImpact exists -- no
      // synchronous setState needed here, only the async resolution below.
      loadImpact().then(text => {
        if (!cancelled) {
          setImpact(text)
          setChecking(false)
        }
      })
    }
    return () => { cancelled = true }
    // Runs once per mount -- the caller remounts this component fresh each
    // time confirming starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const blocked = warnings.some(w => w.severity === 'blocking')
  const confirmVariant = tone === 'destructive' ? 'danger' : 'primary'

  async function confirm() {
    setBusy(true)
    await onConfirm()
    setBusy(false)
  }

  if (placement === 'inline') {
    const impactText = loadImpact ? impact : body
    return (
      <span className="row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'center' }}>
        {checking ? (
          <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>Checking…</span>
        ) : impactText ? (
          <span style={{ color: 'var(--muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {impactText}
          </span>
        ) : null}
        <Button variant={confirmVariant} size="sm" busy={busy && '…'} onClick={confirm} disabled={checking || blocked}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
        {blocked && blockedReason && (
          <span style={{ color: 'var(--muted)', fontSize: 'var(--fs-label)', whiteSpace: 'nowrap' }}>{blockedReason}</span>
        )}
      </span>
    )
  }

  return (
    // The left rule follows tone: danger for destructive confirms, primary
    // for affirmative-but-deliberate ones -- red is reserved for errors and
    // critical conditions.
    <div className="card" style={{ borderLeft: `4px solid ${tone === 'destructive' ? 'var(--danger)' : 'var(--primary)'}` }}>
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {body && <p style={{ marginTop: 0 }}>{body}</p>}
      {checking && <p style={{ color: 'var(--muted)' }}>Checking…</p>}
      {impact && <p style={{ color: 'var(--muted)' }}>{impact}</p>}

      {warnings.map((w, i) => (
        <div
          key={i}
          className="alert"
          style={{
            background: w.severity === 'blocking' ? 'var(--danger-bg)' : 'var(--warn-alert-bg)',
            color: w.severity === 'blocking' ? 'var(--danger-fg)' : 'var(--warn-fg)',
            border: `1px solid ${w.severity === 'blocking' ? 'var(--danger-border)' : 'var(--warn-alert-border)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--fs-micro)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>
            {w.severity === 'blocking' ? 'Blocking' : 'Advisory'}
          </div>
          {w.content}
        </div>
      ))}

      {extra}

      <div className="row" style={{ gap: 8, marginTop: 12, alignItems: 'center' }}>
        <Button variant={confirmVariant} size="sm" busy={busy && '…'} onClick={confirm} disabled={checking || blocked} title={confirmTitle}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
        {blocked && blockedReason && (
          <span style={{ fontSize: 'var(--fs-label)', color: 'var(--muted)' }}>{blockedReason}</span>
        )}
      </div>
    </div>
  )
}
