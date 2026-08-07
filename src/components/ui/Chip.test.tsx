import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from './Chip'

describe('Chip', () => {
  it('scope chip renders as a button and fires onSelect', async () => {
    const onSelect = vi.fn()
    render(<Chip variant="scope" selected={false} onSelect={onSelect}>Today</Chip>)
    await userEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('selected scope chip carries the selected class', () => {
    render(<Chip variant="scope" selected onSelect={() => {}}>Today</Chip>)
    expect(screen.getByRole('button')).toHaveClass('ui-chip--selected')
  })

  it('toggle chip shows the clear affix only when on', () => {
    const { rerender } = render(<Chip variant="toggle" selected={false} onToggle={() => {}}>Archived</Chip>)
    expect(screen.getByRole('button')).not.toHaveTextContent('✕')
    rerender(<Chip variant="toggle" selected onToggle={() => {}}>Archived</Chip>)
    expect(screen.getByRole('button')).toHaveTextContent('✕')
  })

  it('static chip is not a button', () => {
    render(<Chip variant="static" tone="warn">3 pending</Chip>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('3 pending')).toHaveClass('ui-chip--static-warn')
  })
})
