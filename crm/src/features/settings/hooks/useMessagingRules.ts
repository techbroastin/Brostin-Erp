import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMessagingRules, updateMessagingRules } from '@/features/settings/services/settingsService'

export const messagingRulesQueryKey = ['settings', 'messaging-rules'] as const

export function useMessagingRules() {
  return useQuery({ queryKey: messagingRulesQueryKey, queryFn: () => getMessagingRules() })
}

export function useUpdateMessagingRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMessagingRules,
    onSuccess: (updated) => {
      queryClient.setQueryData(messagingRulesQueryKey, updated)
    },
  })
}
