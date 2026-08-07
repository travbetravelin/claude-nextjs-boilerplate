import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DisclosureNote from './DisclosureNote'

describe('DisclosureNote', () => {
  it('renders the summary sentence and body', () => {
    render(
      <DisclosureNote summary="Totals include archived rows.">
        <p>The full explanation.</p>
      </DisclosureNote>
    )
    expect(screen.getByText('Totals include archived rows.')).toBeInTheDocument()
    expect(screen.getByText('The full explanation.')).toBeInTheDocument()
  })

  it('warning tone adds the warning class', () => {
    const { container } = render(
      <DisclosureNote summary="Heads up" tone="warning">body</DisclosureNote>
    )
    expect(container.querySelector('details')).toHaveClass('disclosure-note--warning')
  })
})
