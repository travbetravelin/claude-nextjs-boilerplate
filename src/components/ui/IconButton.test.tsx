import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IconButton from './IconButton'

describe('IconButton', () => {
  it('exposes its aria-label and mirrors it into title', async () => {
    const onClick = vi.fn()
    render(<IconButton icon="edit" aria-label="Edit row" onClick={onClick} />)
    const btn = screen.getByRole('button', { name: 'Edit row' })
    expect(btn).toHaveAttribute('title', 'Edit row')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders greyed but present when disabled', () => {
    render(<IconButton icon="edit" aria-label="Edit row" disabled />)
    expect(screen.getByRole('button', { name: 'Edit row' })).toBeDisabled()
  })

  it('applies the size class', () => {
    render(<IconButton icon="edit" aria-label="Edit row" size="lg" />)
    expect(screen.getByRole('button')).toHaveClass('icon-btn--lg')
  })
})
