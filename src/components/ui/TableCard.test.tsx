import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TableCard from './TableCard'

describe('TableCard', () => {
  it('wraps children in the .table-card scroll container with sticky headers by default', () => {
    render(
      <TableCard>
        <table>
          <tbody>
            <tr><td>Row</td></tr>
          </tbody>
        </table>
      </TableCard>
    )
    expect(screen.getByRole('table').parentElement).toHaveClass('table-card', 'table-card--sticky')
  })

  it('stickyHeader={false} opts a surface out', () => {
    render(
      <TableCard stickyHeader={false}>
        <table>
          <tbody>
            <tr><td>Row</td></tr>
          </tbody>
        </table>
      </TableCard>
    )
    const card = screen.getByRole('table').parentElement!
    expect(card.className).toBe('table-card')
  })
})
