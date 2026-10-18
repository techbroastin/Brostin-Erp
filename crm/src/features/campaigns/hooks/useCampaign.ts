import { useQuery } from '@tanstack/react-query'
import { getCampaignById } from '@/features/campaigns/services/campaignService'

export const campaignDetailQueryKey = (id: string) => ['campaigns', 'detail', id] as const

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignDetailQueryKey(id),
    queryFn: () => getCampaignById(id),
  })
}
