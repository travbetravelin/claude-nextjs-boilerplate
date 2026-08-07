import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExpandableRow from './ExpandableRow'

function renderRow(expanded: boolean) {
  return render(
    <table>
      <tbody>
        <ExpandableRow
          expanded={expanded}
          colSpan={3}
          cells={<td>Visible cell</td>}
          detail={<div>Detail panel</div>}
        />
      </tbody>
    </table>
  )
}

describe('ExpandableRow', () => {
  it('renders only the cells row when collapsed', () => {
    renderRow(false)
    expect(screen.getByText('Visible cell')).toBeInTheDocument()
    expect(screen.queryByText('Detail panel')).toBeNull()
  })

  it('renders the detail row when expanded', () => {
    renderRow(true)
    expect(screen.getByText('Detail panel')).toBeInTheDocument()
  })
})
