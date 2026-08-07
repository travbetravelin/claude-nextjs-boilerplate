// Mechanical extraction of the .table-card wrapper used on every list
// page -- the card that owns a table's horizontal scroll.
export default function TableCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="table-card" style={style}>
      {children}
    </div>
  )
}
