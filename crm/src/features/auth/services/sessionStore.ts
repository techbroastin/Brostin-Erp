/**
 * Who is signed in on this device — a leaf module (imports nothing) so
 * any service, including the Audit Engine, can read it without import
 * cycles. Kept in localStorage so a reload stays signed in; every read
 * and write is wrapped because storage can be blocked (private mode).
 *
 * Holds only an identity snapshot. The role that decides access is
 * always re-read from the user list (authService.getCurrentUser), so a
 * role change or removal in Settings → Users takes effect at once.
 *
 * Demo sign-in only: this is NOT a security boundary. Real sessions,
 * and access rules the browser can't bypass, come with Supabase Auth
 * and RLS (docs/IMPLEMENTATION_PLAN.md §23, docs/ARCHITECTURE.md §14).
 */

export type SessionSnapshot = {
  userId: string
  name: string
  /** Role label at the time of the last check, e.g. "Owner" — used for audit attribution. */
  roleLabel: string
}

const STORAGE_KEY = 'broastin-crm-session'

/** Used only when localStorage is unavailable. */
let memoryValue: string | null = null
let version = 0
const listeners = new Set<() => void>()

function readRaw(): string | null {
  try {
    return globalThis.localStorage ? globalThis.localStorage.getItem(STORAGE_KEY) : memoryValue
  } catch {
    return memoryValue
  }
}

function writeRaw(value: string | null) {
  memoryValue = value
  try {
    if (!globalThis.localStorage) return
    if (value === null) globalThis.localStorage.removeItem(STORAGE_KEY)
    else globalThis.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage blocked — the in-memory value still covers this tab.
  }
}

export function getSession(): SessionSnapshot | null {
  const raw = readRaw()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<SessionSnapshot>
    return typeof parsed.userId === 'string' && typeof parsed.name === 'string' && typeof parsed.roleLabel === 'string'
      ? (parsed as SessionSnapshot)
      : null
  } catch {
    return null
  }
}

export function setSession(snapshot: SessionSnapshot | null) {
  const next = snapshot ? JSON.stringify(snapshot) : null
  if (next === readRaw()) return
  writeRaw(next)
  notifySessionChanged()
}

/** Tells subscribers (the app shell) to re-check the signed-in user, e.g. after a role change. */
export function notifySessionChanged() {
  version += 1
  listeners.forEach((listener) => listener())
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Changes whenever the session or the signed-in user's record may have changed. */
export function getSessionVersion(): number {
  return version
}
