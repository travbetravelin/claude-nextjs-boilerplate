'use client'

// Icon-only buttons exist for exactly one class of action: reversible,
// repeated row actions -- ✎ edit is the canonical case. Anything with
// consequences (Deactivate, Archive, Approve/Reject, Save) stays a worded
// Button. Where an action is desk-only, the icon still renders on mobile
// -- greyed and disabled -- so the phone teaches instead of hiding.
//
// aria-label is required, not optional: an icon button with no accessible
// name is a mystery button to a screen reader.

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: 'edit'
  'aria-label': string
  // 'sm' is the 30px desk row size; 'lg' is the 44px thumb size for
  // mobile cards (Field density's control height).
  size?: 'sm' | 'lg'
}

const GLYPHS: Record<Props['icon'], string> = {
  edit: '✎',
}

export default function IconButton({ icon, size = 'sm', className, type, title, ...rest }: Props) {
  return (
    <button
      type={type ?? 'button'}
      className={`icon-btn icon-btn--${size}${className ? ` ${className}` : ''}`}
      // The tooltip mirrors the aria-label unless the caller says more
      // (e.g. "Edit — desk only" on a greyed mobile pencil).
      title={title ?? rest['aria-label']}
      {...rest}
    >
      <span aria-hidden="true">{GLYPHS[icon]}</span>
    </button>
  )
}
