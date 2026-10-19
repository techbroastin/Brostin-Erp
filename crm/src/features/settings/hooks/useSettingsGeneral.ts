import { useQuery } from '@tanstack/react-query'
import { getGeneralSettings } from '@/features/settings/services/settingsService'

export const settingsGeneralQueryKey = ['settings', 'general'] as const

export function useSettingsGeneral() {
  return useQuery({
    queryKey: settingsGeneralQueryKey,
    queryFn: () => getGeneralSettings(),
  })
}
