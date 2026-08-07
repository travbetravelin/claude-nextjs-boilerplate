// One sentence visible, the rest on request. Instead of a generic
// "Read me" summary, the collapsed bar carries the note's single most
// important sentence, so the page starts at its content without losing
// the rule.
interface Props {
  summary: string
  tone?: 'neutral' | 'warning'
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function DisclosureNote({ summary, tone = 'neutral', defaultOpen = false, children }: Props) {
  return (
    <details className={`disclosure-note${tone === 'warning' ? ' disclosure-note--warning' : ''}`} open={defaultOpen || undefined}>
      <summary>
        <span className="disclosure-note-summary">{summary}</span>
        <span className="disclosure-note-affordance">Read the full rule ▾</span>
      </summary>
      <div className="disclosure-note-body">{children}</div>
    </details>
  )
}
