'use client'

import { useState } from 'react'
import Button from './Button'
import ConfirmDialog from './ConfirmDialog'

interface Props {
  active: boolean
  onArchive: () => Promise<void>
  onRestore: () => Promise<void>
  archiveLabel?: string
  restoreLabel?: string
  // Static copy shown while confirming. Use loadConfirmText instead
  // whenever the archive could hide already-accrued data (records, hours,
  // dollars) -- it's called once confirming starts and its result shown in
  // place of confirmText, so the person sees real numbers before deciding.
  confirmText?: string
  loadConfirmText?: () => Promise<string>
}

// The archiving doctrine as a control (docs/recipes/archiving-not-deleting.md):
// archive always confirms in place; restore never does. The trigger renders
// plain -- red is reserved for errors and critical conditions, so the danger
// color appears on the confirm step, not the button that opens it.
export default function ArchiveButton({
  active, onArchive, onRestore, archiveLabel = 'Archive', restoreLabel = 'Restore', confirmText, loadConfirmText,
}: Props) {
  const [confirming, setConfirming] = useState(false)
  const [restoring, setRestoring] = useState(false)

  async function runArchive() {
    await onArchive()
    setConfirming(false)
  }

  async function runRestore() {
    setRestoring(true)
    await onRestore()
    setRestoring(false)
  }

  if (!active) {
    return (
      <Button variant="primary" size="sm" busy={restoring && '…'} onClick={runRestore}>
        {restoreLabel}
      </Button>
    )
  }

  if (confirming) {
    return (
      <ConfirmDialog
        placement="inline"
        body={confirmText}
        loadImpact={loadConfirmText}
        confirmLabel="Confirm"
        onConfirm={runArchive}
        onCancel={() => setConfirming(false)}
      />
    )
  }

  return (
    <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
      {archiveLabel}
    </Button>
  )
}
