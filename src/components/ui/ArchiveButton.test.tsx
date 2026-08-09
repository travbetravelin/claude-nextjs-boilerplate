import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArchiveButton from './ArchiveButton'

describe('ArchiveButton', () => {
  it('archive confirms before calling onArchive', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn().mockResolvedValue(undefined)
    render(
      <ArchiveButton
        active
        confirmText="Past records keep their history."
        onArchive={onArchive}
        onRestore={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Archive' }))
    expect(onArchive).not.toHaveBeenCalled()
    expect(screen.getByText('Past records keep their history.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onArchive).toHaveBeenCalledOnce()
  })

  it('restore never confirms', async () => {
    const user = userEvent.setup()
    const onRestore = vi.fn().mockResolvedValue(undefined)
    render(<ArchiveButton active={false} onArchive={vi.fn()} onRestore={onRestore} />)

    await user.click(screen.getByRole('button', { name: 'Restore' }))
    expect(onRestore).toHaveBeenCalledOnce()
  })
})
