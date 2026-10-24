import { useEffect, useSyncExternalStore } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { peekCurrentUser, signIn, signOut } from '@/features/auth/services/authService'
import { getSessionVersion, notifySessionChanged, subscribeSession } from '@/features/auth/services/sessionStore'
import type { SettingsUser } from '@/features/settings/types/settings'

/**
 * The signed-in user, re-read whenever the session or the user list
 * changes (sign-in, sign-out, a role change in Settings → Users, or
 * signing out in another tab).
 */
export function useCurrentUser(): SettingsUser | null {
  useSyncExternalStore(subscribeSession, getSessionVersion)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'broastin-crm-session') notifySessionChanged()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return peekCurrentUser()
}

export function useSignIn() {
  return useMutation({ mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password) })
}

/** Signs out and drops every cached query, so the next person never sees the last one's data. */
export function useSignOut() {
  const queryClient = useQueryClient()
  return () => {
    signOut()
    queryClient.clear()
  }
}
