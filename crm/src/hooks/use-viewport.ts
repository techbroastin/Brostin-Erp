import { useSyncExternalStore } from 'react'

/**
 * Desktop/mobile SHELL split threshold. Centralized here so it can be
 * changed in one place. Provisional — docs/MOBILE_UI_SPEC.md and
 * docs/DESKTOP_UI_SPEC.md both mark exact breakpoints as NOT YET FINALIZED.
 */
const DESKTOP_SHELL_QUERY = '(min-width: 1024px)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_SHELL_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_SHELL_QUERY).matches
}

function getServerSnapshot() {
  return false
}

/**
 * Picks between the Mobile Manager shell and the Desktop Admin shell.
 * This is a one-time structural choice between two separate component
 * trees — not a responsive CSS breakpoint used to reflow a single layout.
 * Defaults to mobile (false) before the first measurement, mobile-first.
 */
export function useIsDesktopViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
