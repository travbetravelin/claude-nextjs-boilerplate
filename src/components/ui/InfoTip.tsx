'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  text: string
}

// Placement is computed in JS and the panel is rendered through a portal to
// <body>, rather than positioned absolutely next to the trigger. Both are
// necessary here: most of these tips live inside `.table-card` elements that
// set `overflow-x: auto`, and an absolutely positioned child of a scroll
// container gets clipped at its edge. A portal + `position: fixed` escapes
// that entirely. (Browser-native `title` tooltips can't be clipped either,
// but they also can't be styled and take ~1s to appear.)
const MARGIN = 12
const GAP = 10

export default function InfoTip({ text }: Props) {
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean; arrow: number } | null>(null)

  const place = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const t = trigger.getBoundingClientRect()
    const p = panel.getBoundingClientRect()

    // Prefer below; flip above when there isn't room and there is above.
    const roomBelow = window.innerHeight - t.bottom
    const above = roomBelow < p.height + GAP + MARGIN && t.top > p.height + GAP + MARGIN
    const top = above ? t.top - p.height - GAP : t.bottom + GAP

    // Centre on the trigger, then clamp inside the viewport so a tip near the
    // right edge of a wide table doesn't run off screen.
    const ideal = t.left + t.width / 2 - p.width / 2
    const left = Math.max(MARGIN, Math.min(ideal, window.innerWidth - p.width - MARGIN))

    // Once the panel is clamped it's no longer centred on the trigger, so the
    // arrow has to be offset independently or it points at empty space.
    const arrow = Math.max(10, Math.min(t.left + t.width / 2 - left, p.width - 10))

    setPos({ top, left, above, arrow })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    // Reposition rather than drift: these sit inside horizontally scrollable
    // cards, so the trigger can move under a fixed panel.
    const onMove = () => place()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, place])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="info-tip"
        aria-label="More information"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        // Touch has no hover, so a tap toggles.
        onClick={e => { e.preventDefault(); setOpen(o => !o) }}
      >
        i
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          id={id}
          role="tooltip"
          className={`info-tip-panel${pos?.above ? ' info-tip-panel-above' : ''}`}
          style={{
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            ['--info-tip-arrow' as string]: `${pos?.arrow ?? 0}px`,
            // Hidden until measured, so it never flashes at 0,0.
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  )
}
