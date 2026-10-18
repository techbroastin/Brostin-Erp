import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { List, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { getCampaignOverview } from '@/features/campaigns/services/campaignService'

/**
 * Desktop Campaigns Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 15 — Campaigns". Status counts only — no performance/
 * engagement metric exists in the mock data (docs/NAVIGATION.md §11:
 * "exact metrics NOT YET FINALIZED").
 */
export function DesktopCampaignOverviewContent() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['campaigns', 'overview'],
    queryFn: () => getCampaignOverview(),
  })

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total-campaigns', label: 'Total Campaigns', value: String(data.totalCampaigns) },
        { id: 'draft-count', label: 'Draft', value: String(data.draftCount) },
        { id: 'scheduled-count', label: 'Scheduled', value: String(data.scheduledCount) },
        { id: 'sent-count', label: 'Sent', value: String(data.sentCount) },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Overview</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <CampaignErrorState message="Couldn't load campaign overview." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {isPending
              ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
              : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaigns Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/campaigns/all" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <List className="size-4" />
                All Campaigns
              </Link>
              <Link to="/campaigns/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
                <Plus className="size-4" />
                Create Campaign
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
