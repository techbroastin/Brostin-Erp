import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { DesktopCampaignCalendarContent } from '@/features/campaigns/components/desktop/DesktopCampaignCalendarContent'

/** /campaigns/calendar — Campaign Calendar. Desktop Admin only. */
export function CampaignCalendarScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCampaignCalendarContent /> : <CampaignDesktopOnlyNotice />
}
