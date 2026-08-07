import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatTile from './StatTile'

describe('StatTile', () => {
  it('renders label, value, and sub line', () => {
    render(<StatTile label="Open items" value="12" sub="3 added this week" />)
    expect(screen.getByText('Open items')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3 added this week')).toBeInTheDocument()
  })

  it('applies the tone class', () => {
    const { container } = render(<StatTile label="Overdue" value="4" tone="danger" />)
    expect(container.firstChild).toHaveClass('stat-tile--danger')
  })
})
