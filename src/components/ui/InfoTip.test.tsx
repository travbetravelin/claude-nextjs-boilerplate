import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InfoTip from './InfoTip'

describe('InfoTip', () => {
  it('renders the trigger closed, and hover opens then closes the tooltip panel', async () => {
    // Hover, not click: userEvent.click synthesizes a mouseenter first, so
    // in jsdom the hover-open and the tap-toggle cancel out — a sequence no
    // real device produces (touch has no hover).
    const user = userEvent.setup()
    render(<InfoTip text="Explains why this column exists." />)

    const trigger = screen.getByRole('button', { name: 'More information' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.hover(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Explains why this column exists.')

    await user.unhover(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
