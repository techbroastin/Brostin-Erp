import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCampaign } from '@/features/campaigns/services/campaignService'

/**
 * The first useMutation in this codebase — every prior feature is
 * read-only. Invalidates the Campaigns list/overview queries so the
 * new in-memory campaign appears immediately without a page reload.
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
