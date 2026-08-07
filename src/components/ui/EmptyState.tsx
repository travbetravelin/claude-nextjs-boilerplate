// Three scopes, three shapes. The scope decides the shape; the copy rule
// decides the words: name the absent thing, not the container ("No entries
// match these filters", not "No data"); distinguish *empty* from *filtered
// to nothing* -- they need different second lines, and only the second one
// is the user's own doing; never apologise, never exclaim.

interface CellProps {
  scope: 'cell'
}
interface TableProps {
  scope: 'table'
  colSpan: number
  message: string
  hint?: string
}
interface PageProps {
  scope: 'page'
  message: string
  hint?: string
  action?: { label: string; onClick: () => void }
}

type Props = CellProps | TableProps | PageProps

export default function EmptyState(props: Props) {
  if (props.scope === 'cell') {
    return <span style={{ color: 'var(--border-strong)' }}>—</span>
  }

  if (props.scope === 'table') {
    return (
      <tr>
        <td colSpan={props.colSpan} style={{ textAlign: 'center', padding: 'calc(var(--s5) - 2px) var(--s4)' }}>
          <div style={{ fontSize: 'var(--fs-table)', fontWeight: 600, color: 'var(--text)' }}>{props.message}</div>
          {props.hint && (
            <div style={{ fontSize: 'var(--fs-label)', color: 'var(--muted)', marginTop: 3 }}>{props.hint}</div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s4)', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, margin: '0 auto 11px', borderRadius: '50%', background: 'var(--primary-bg)', border: '1px solid var(--primary-200)' }} />
      <div style={{ fontSize: 'var(--fs-table)', fontWeight: 600, color: 'var(--text)' }}>{props.message}</div>
      {props.hint && (
        <div style={{ fontSize: 'var(--fs-label)', color: 'var(--muted)', margin: '4px auto 12px', maxWidth: 230 }}>{props.hint}</div>
      )}
      {props.action && (
        <button className="btn btn-secondary btn-sm" onClick={props.action.onClick}>{props.action.label}</button>
      )}
    </div>
  )
}
