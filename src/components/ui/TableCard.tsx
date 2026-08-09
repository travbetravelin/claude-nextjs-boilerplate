// Mechanical extraction of the .table-card wrapper used on every list
// page -- the card that owns a table's horizontal scroll.
//
// Sticky headers are the default (design decision): the card caps its own
// height and owns vertical scroll, so the header row pins to it while the
// rows scroll underneath -- a sticky header can only stick to its nearest
// scrolling ancestor, and .table-card's overflow-x already made that this
// box rather than the page. A table shorter than the cap never scrolls
// internally, so nothing changes for it. Pass stickyHeader={false} only
// when a surface genuinely can't live with internal scroll.
export default function TableCard({ children, style, stickyHeader = true }: {
  children: React.ReactNode
  style?: React.CSSProperties
  stickyHeader?: boolean
}) {
  return (
    <div className={stickyHeader ? 'table-card table-card--sticky' : 'table-card'} style={style}>
      {children}
    </div>
  )
}
