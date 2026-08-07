import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TableCard from './TableCard'

describe('TableCard', () => {
  it('wraps children in the .table-card scroll container', () => {
    render(
      <TableCard>
        <table>
          <tbody>
            <tr><td>Row</td></tr>
          </tbody>
        </table>
      </TableCard>
    )
    expect(screen.getByRole('table').parentElement).toHaveClass('table-card')
  })
})
