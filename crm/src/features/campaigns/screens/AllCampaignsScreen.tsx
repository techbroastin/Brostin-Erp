import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { DesktopAllCampaignsContent } from '@/features/campaigns/components/desktop/DesktopAllCampaignsContent'

/** All Campaigns route element — /campaigns/all. Desktop Admin only. */
export function AllCampaignsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopAllCampaignsContent /> : <CampaignDesktopOnlyNotice />
}
