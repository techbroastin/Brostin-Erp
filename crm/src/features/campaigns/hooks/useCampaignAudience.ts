import { useQuery } from '@tanstack/react-query'
import { getCampaignAudience } from '@/features/campaigns/services/campaignService'

export function useCampaignAudience(id: string) {
  return useQuery({ queryKey: ['campaigns', 'audience', id], queryFn: () => getCampaignAudience(id) })
}
