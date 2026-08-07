'use client'

// One shell, three jobs. A chip is never the only way to reach something --
// every toggle chip should have an equivalent in a FilterBar, and every
// scope strip an equivalent picker. Chips are accelerators, not the sole
// path.

type StaticTone = 'primary' | 'warn' | 'info' | 'neutral'

interface ScopeProps {
  variant: 'scope'
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}
interface ToggleProps {
  variant: 'toggle'
  selected: boolean
  onToggle: () => void
  children: React.ReactNode
}
interface StaticProps {
  variant: 'static'
  tone?: StaticTone
  // Escape hatch for a palette wider than the four generic tones --
  // overrides tone's background/color on the same shared shell rather than
  // inventing a second component for it. Pass token references
  // ('var(--...)'), never raw hexes.
  bg?: string
  fg?: string
  border?: string
  affix?: string
  children: React.ReactNode
}

type Props = ScopeProps | ToggleProps | StaticProps

export default function Chip(props: Props) {
  if (props.variant === 'static') {
    const tone = props.tone ?? 'neutral'
    const override = props.bg || props.fg || props.border
      ? { background: props.bg, color: props.fg, ...(props.border ? { border: `1px solid ${props.border}` } : {}) }
      : undefined
    return (
      <span className={`ui-chip ui-chip--static-${tone}`} style={override}>
        {props.children}
        {props.affix && <span className="ui-chip-affix">{props.affix}</span>}
      </span>
    )
  }

  if (props.variant === 'scope') {
    return (
      <button
        type="button"
        className={`ui-chip${props.selected ? ' ui-chip--selected' : ''}`}
        onClick={props.onSelect}
      >
        {props.children}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`ui-chip${props.selected ? ' ui-chip--toggle-on' : ''}`}
      onClick={props.onToggle}
    >
      {props.children}
      {props.selected && <span className="ui-chip-affix">✕</span>}
    </button>
  )
}
