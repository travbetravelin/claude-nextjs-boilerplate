// Mechanical extraction of .form-group so it is never hand-assembled at
// call sites. warning/notice cover the one recurring exception that isn't
// purely mechanical: a field-level message under the control (warning =
// blocking, --danger; notice = advisory, --warn-fg -- the same
// blocking/advisory split ConfirmDialog uses for its warnings).
interface Props {
  label: React.ReactNode
  // Appends the standard muted "(optional)" hint after the label -- one
  // rendering, not a hand-rolled span at every optional field.
  optional?: boolean
  htmlFor?: string
  warning?: React.ReactNode
  notice?: React.ReactNode
  // For inline-edit rows that need flex/width/margin control on the
  // .form-group itself.
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function Field({ label, optional, htmlFor, warning, notice, style, children }: Props) {
  return (
    <div className="form-group" style={style}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span style={{ color: 'var(--muted-light)', fontWeight: 400 }}> (optional)</span>}
      </label>
      {children}
      {warning && (
        <div style={{ color: 'var(--danger)', fontSize: 'var(--fs-body)', marginTop: 4 }}>{warning}</div>
      )}
      {notice && (
        <div style={{ color: 'var(--warn-fg)', fontSize: 'var(--fs-body)', marginTop: 4 }}>{notice}</div>
      )}
    </div>
  )
}
