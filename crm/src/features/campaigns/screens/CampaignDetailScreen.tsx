import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useCampaign } from '@/features/campaigns/hooks/useCampaign'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { DesktopCampaignDetailContent } from '@/features/campaigns/components/desktop/DesktopCampaignDetailContent'

/** Campaign Detail route element — /campaigns/:campaignId. Not a menu item. Desktop Admin only. */
export function CampaignDetailScreen() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: campaign, isPending, isError, refetch } = useCampaign(campaignId ?? '')

  if (!isDesktop) {
    return <CampaignDesktopOnlyNotice />
  }

  if (isError) {
    return <CampaignErrorState message="Couldn't load this campaign." onRetry={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Campaign not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This campaign doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return <DesktopCampaignDetailContent campaign={campaign} />
}
