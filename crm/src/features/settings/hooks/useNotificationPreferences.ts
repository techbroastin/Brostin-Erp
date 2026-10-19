import { useQuery } from '@tanstack/react-query'
import { listNotificationPreferences } from '@/features/settings/services/settingsService'

export const notificationPreferencesQueryKey = ['settings', 'notifications'] as const

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationPreferencesQueryKey,
    queryFn: () => listNotificationPreferences(),
  })
}
