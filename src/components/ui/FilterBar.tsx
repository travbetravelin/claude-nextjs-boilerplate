// Mechanical extraction of the .filter-bar wrapper -- the cluster of
// selects/date inputs/chips above a table.
export default function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="filter-bar">{children}</div>
}
