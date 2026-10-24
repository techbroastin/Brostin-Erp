import { findSettingsUserByEmail, findSettingsUserById } from '@/features/settings/services/settingsService'
import { ROLE_LABELS, type SettingsUser } from '@/features/settings/types/settings'
import { can, PERMISSION_AREA_LABELS, type PermissionArea } from '@/features/settings/utils/permissions'
import { DEMO_PASSWORD } from '@/features/auth/mock/auth.mock'
import { getSession, setSession } from '@/features/auth/services/sessionStore'

const SIMULATED_LATENCY_MS = 500

/**
 * CRM sign-in — docs/IMPLEMENTATION_PLAN.md §23 (email + password) with
 * Book 3 §14's four roles. The swap point for Supabase Auth: screens
 * only call signIn/signOut/getCurrentUser, never the demo check below.
 *
 * Demo mode: accounts are the users in Settings → Users, all sharing
 * DEMO_PASSWORD. Nothing here is real security — the browser can change
 * anything in it. Real enforcement must come from Supabase Auth + RLS.
 */

/** Shown on the sign-in screen while sign-in is in demo mode. */
export const DEMO_PASSWORD_HINT = DEMO_PASSWORD

export class PermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionError'
  }
}

/** The signed-in user without side effects — safe to call while React renders. */
export function peekCurrentUser(): SettingsUser | null {
  const session = getSession()
  return session ? findSettingsUserById(session.userId) : null
}

/** The signed-in user, resolved live from the user list; null if signed out or the account was removed. */
export function getCurrentUser(): SettingsUser | null {
  const session = getSession()
  const user = peekCurrentUser()
  if (!session || !user) return null
  const roleLabel = ROLE_LABELS[user.role]
  // Keep the snapshot (used for audit attribution) in step with renames and role changes.
  if (session.name !== user.name || session.roleLabel !== roleLabel) {
    setSession({ userId: user.id, name: user.name, roleLabel })
  }
  return user
}

export async function signIn(email: string, password: string): Promise<SettingsUser> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
  const user = findSettingsUserByEmail(email)
  // Same message either way, so the form never reveals which emails exist.
  if (!user || password !== DEMO_PASSWORD) {
    throw new Error('Email or password is incorrect.')
  }
  setSession({ userId: user.id, name: user.name, roleLabel: ROLE_LABELS[user.role] })
  return user
}

export function signOut() {
  setSession(null)
}

/**
 * Application-level check every change goes through (docs/CLAUDE.md
 * §23: never rely only on hiding buttons). Services call it before
 * touching their store.
 */
export function requirePermission(area: PermissionArea, level: 'view' | 'manage' = 'manage'): SettingsUser {
  const user = getCurrentUser()
  if (!user) throw new PermissionError('Please sign in again.')
  if (!can(user.role, area, level)) {
    throw new PermissionError(
      `Your role (${ROLE_LABELS[user.role]}) can't ${level === 'manage' ? 'make changes in' : 'open'} ${PERMISSION_AREA_LABELS[area]}.`,
    )
  }
  return user
}
