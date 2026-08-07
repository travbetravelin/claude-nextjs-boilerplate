import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders its label and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('maps variants to the .btn-* classes', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-danger')
  })

  it('shows the busy label and blocks clicks while busy', async () => {
    const onClick = vi.fn()
    render(<Button busy="Saving…" onClick={onClick}>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Saving…' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('data-busy', 'true')
  })
})
