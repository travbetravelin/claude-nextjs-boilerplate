'use client'

import { useEffect, useSyncExternalStore } from 'react'
import Chip from '@/components/ui/Chip'
import { type ThemeMode, getStoredThemeMode, setThemeMode, subscribeThemeMode } from '@/lib/theme'

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
]

export default function ThemeToggle() {
  // Server snapshot is 'system'; the client snapshot reads localStorage.
  // useSyncExternalStore reconciles the two at hydration without a
  // mismatch, and subscribeThemeMode re-renders on every setThemeMode() --
  // no mount effect, no flash of the wrong selection.
  const mode = useSyncExternalStore(subscribeThemeMode, getStoredThemeMode, () => 'system' as ThemeMode)

  // While 'system' is selected, live-follow OS changes instead of only
  // resolving once at click time.
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeMode('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  function choose(next: ThemeMode) {
    setThemeMode(next)
  }

  return (
    <div className="card">
      <h2>Appearance</h2>
      <p className="page-subtitle">Follows this device unless you pick Light or Dark.</p>
      <div className="row" style={{ gap: 8, marginTop: 8 }}>
        {OPTIONS.map(o => (
          <Chip key={o.mode} variant="scope" selected={mode === o.mode} onSelect={() => choose(o.mode)}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
