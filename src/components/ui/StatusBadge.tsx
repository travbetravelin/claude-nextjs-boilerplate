// Four tones, mapped from data -- the cap is deliberate. A fifth status
// takes an existing tone, or the set is wrong: a badge palette that grows
// per status stops being scannable, which is the whole point of a badge.
export type BadgeTone = 'pending' | 'approved' | 'rejected' | 'neutral'

interface Props {
  tone: BadgeTone
  children: React.ReactNode
  title?: string
  // Positioning only (margins/vertical-align at call sites inside prose or
  // table cells) -- never colors; tones are the whole point.
  style?: React.CSSProperties
}

export default function StatusBadge({ tone, children, title, style }: Props) {
  return (
    <span className={`badge badge-${tone}`} title={title} style={style}>
      {children}
    </span>
  )
}
