import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { DesktopCampaignOverviewContent } from '@/features/campaigns/components/desktop/DesktopCampaignOverviewContent'

/** Campaigns Overview route element — /campaigns. Desktop Admin only — see CampaignDesktopOnlyNotice. */
export function CampaignOverviewScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCampaignOverviewContent /> : <CampaignDesktopOnlyNotice />
}
