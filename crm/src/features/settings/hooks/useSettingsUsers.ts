import { useQuery } from '@tanstack/react-query'
import { listSettingsUsers } from '@/features/settings/services/settingsService'

export const settingsUsersQueryKey = ['settings', 'users'] as const

export function useSettingsUsers() {
  return useQuery({
    queryKey: settingsUsersQueryKey,
    queryFn: () => listSettingsUsers(),
  })
}
