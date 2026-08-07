// Browser-local theme preference -- Light / Dark / System.
// 'system' means "no explicit override": data-theme tracks
// prefers-color-scheme live rather than being pinned. This key is also
// duplicated verbatim in src/app/layout.tsx's blocking inline script, which
// must run before paint (before this module loads) to avoid a flash of the
// wrong theme -- keep the two in sync if the key or resolution logic ever
// changes.
export const THEME_STORAGE_KEY = 'app-theme'

export type ThemeMode = 'light' | 'dark' | 'system'

// The browser-chrome color per theme -- mirrors the resolved value of
// --primary-dark in src/app/globals.css for each theme. Update on rebrand
// (these are the two hand-synced values the brand layer's comment points
// at), along with the copies in layout.tsx's inline script.
const THEME_COLOR_LIGHT = '#1e4468'
const THEME_COLOR_DARK = '#132c45'

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

// Applies the resolved theme to the document -- absence of data-theme means
// light, since :root already holds light values. (globals.css also attaches
// the light values to [data-theme="light"] so a light island can be scoped
// inside a dark page -- but <html> itself never needs the attribute to be
// light.)
export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode)
  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT)
}

// Change listeners, so React components can read the stored mode through
// useSyncExternalStore instead of a mount effect (which would either flash
// or trip the set-state-in-effect lint rule).
const listeners = new Set<() => void>()

export function subscribeThemeMode(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setThemeMode(mode: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  applyTheme(mode)
  listeners.forEach(l => l())
}
