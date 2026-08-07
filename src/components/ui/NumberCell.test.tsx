import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NumberCell from './NumberCell'

describe('NumberCell', () => {
  it('renders a td carrying the data-num attribute', () => {
    render(
      <table>
        <tbody>
          <tr>
            <NumberCell>42.50</NumberCell>
          </tr>
        </tbody>
      </table>
    )
    const cell = screen.getByRole('cell')
    expect(cell).toHaveAttribute('data-num')
    expect(cell).toHaveTextContent('42.50')
  })
})
