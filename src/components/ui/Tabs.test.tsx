import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tabs from './Tabs'

const tabs = [
  { key: 'a', label: 'First', content: <div>First panel</div> },
  { key: 'b', label: 'Second', content: <div>Second panel</div> },
]

describe('Tabs', () => {
  it('shows the first tab by default and switches on click', async () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByText('First panel').parentElement).toHaveStyle({ display: 'block' })
    expect(screen.getByText('Second panel').parentElement).toHaveStyle({ display: 'none' })

    await userEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getByText('Second panel').parentElement).toHaveStyle({ display: 'block' })
  })

  it('keeps inactive panels mounted (display: none, not unmounted)', () => {
    render(<Tabs tabs={tabs} />)
    // Both panels are in the DOM even though only one shows.
    expect(screen.getByText('Second panel')).toBeInTheDocument()
  })

  it('honors the initial key', () => {
    render(<Tabs tabs={tabs} initial="b" />)
    expect(screen.getByRole('button', { name: 'Second' })).toHaveClass('active')
  })
})
