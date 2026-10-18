import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listCampaigns } from '@/features/campaigns/services/campaignService'
import type { CampaignListParams } from '@/features/campaigns/types/campaign'

/** The central Campaigns-list query key, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const campaignListQueryKey = (params: CampaignListParams) =>
  ['campaigns', 'list', params] as const

export function useCampaigns(params: CampaignListParams) {
  return useQuery({
    queryKey: campaignListQueryKey(params),
    queryFn: () => listCampaigns(params),
    placeholderData: keepPreviousData,
  })
}
