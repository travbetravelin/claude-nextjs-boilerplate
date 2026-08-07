import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('cell scope renders a dash', () => {
    render(<EmptyState scope="cell" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('table scope renders a full-width row with message and hint', () => {
    render(
      <table>
        <tbody>
          <EmptyState scope="table" colSpan={4} message="No entries match these filters" hint="Clear a filter to widen the search" />
        </tbody>
      </table>
    )
    expect(screen.getByText('No entries match these filters')).toBeInTheDocument()
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '4')
  })

  it('page scope renders message and optional action', async () => {
    const onClick = vi.fn()
    render(<EmptyState scope="page" message="No projects yet" action={{ label: 'Add a project', onClick }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add a project' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
