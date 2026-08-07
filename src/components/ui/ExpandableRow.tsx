// One read layout, one edit layout -- named so callers don't invent a
// third shape. Read state is a definition grid; edit is a deliberate
// second action inside it, so someone who only wants to read never lands
// in a form.
//
// Rules this shell exists to enforce:
//  - Chevron only when there's expandable detail. A row with nothing to
//    show renders no chevron at all, not a disabled one.
//  - One row open at a time -- the caller owns `expanded`, so it can refuse
//    to open a second row while one is already open.
//  - Detail is a definition grid (.definition-grid), not a nested table.
//
// The always-visible cells and the chevron trigger stay with the caller
// (their content is too row-specific to generalize); this only centralizes
// the two-row structure and the shared detail-row chrome.
interface Props {
  expanded: boolean
  colSpan: number
  rowClassName?: string
  rowStyle?: React.CSSProperties
  cells: React.ReactNode
  detail: React.ReactNode
}

export default function ExpandableRow({ expanded, colSpan, rowClassName, rowStyle, cells, detail }: Props) {
  return (
    <>
      <tr className={rowClassName} style={rowStyle}>
        {cells}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={colSpan} style={{ background: 'var(--row-hover)', padding: 'var(--s4) calc(var(--s4) + var(--s1))' }}>
            {detail}
          </td>
        </tr>
      )}
    </>
  )
}
