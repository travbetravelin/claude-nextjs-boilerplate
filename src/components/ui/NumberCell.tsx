// Mechanical: counts, quantities and dollars are right-aligned with
// tabular figures everywhere. font-variant-numeric and text-align both
// come from the [data-num] CSS rule -- this just saves writing the bare
// attribute out at every call site.
export default function NumberCell({ children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td data-num {...rest}>
      {children}
    </td>
  )
}
