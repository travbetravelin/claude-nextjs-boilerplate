import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('inline placement confirms and cancels', async () => {
    const onConfirm = vi.fn(async () => {})
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        placement="inline"
        body="Removes 3 rows"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByText('Removes 3 rows')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('card placement renders title, warnings, and blocks on a blocking warning', () => {
    render(
      <ConfirmDialog
        placement="card"
        title="Close this record"
        warnings={[{ severity: 'blocking', content: 'Unresolved items remain' }]}
        blockedReason="Resolve the items first"
        confirmLabel="Close"
        onConfirm={async () => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.getByText('Close this record')).toBeInTheDocument()
    expect(screen.getByText('Unresolved items remain')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled()
    expect(screen.getByText('Resolve the items first')).toBeInTheDocument()
  })

  it('loadImpact shows Checking… then the resolved impact text', async () => {
    render(
      <ConfirmDialog
        placement="card"
        loadImpact={async () => 'Affects 12 rows'}
        confirmLabel="Archive"
        onConfirm={async () => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.getByText('Checking…')).toBeInTheDocument()
    expect(await screen.findByText('Affects 12 rows')).toBeInTheDocument()
  })
})
