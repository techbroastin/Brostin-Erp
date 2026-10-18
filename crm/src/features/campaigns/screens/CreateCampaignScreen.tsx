import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { DesktopCreateCampaignContent } from '@/features/campaigns/components/desktop/DesktopCreateCampaignContent'

/** Create Campaign route element — /campaigns/new. Desktop Admin only. */
export function CreateCampaignScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCreateCampaignContent /> : <CampaignDesktopOnlyNotice />
}
