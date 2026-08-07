import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders its text with the tone class', () => {
    render(<StatusBadge tone="approved">Approved</StatusBadge>)
    expect(screen.getByText('Approved')).toHaveClass('badge', 'badge-approved')
  })

  it('renders the neutral tone', () => {
    render(<StatusBadge tone="neutral">Draft</StatusBadge>)
    expect(screen.getByText('Draft')).toHaveClass('badge-neutral')
  })
})
