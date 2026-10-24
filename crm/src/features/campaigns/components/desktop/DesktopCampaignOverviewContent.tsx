import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, List, Plus } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { getCampaignOverview, getCampaignPerformance } from '@/features/campaigns/services/campaignService'

/**
 * Desktop Campaigns Overview — canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 15 — Campaigns". Status counts plus Book 3 §4's performance
 * view: the delivery funnel of every sent campaign, from the Message
 * Log (simulated delivery). Opens, clicks and redemptions need a
 * provider and the POS, so they aren't shown as numbers.
 */
export function DesktopCampaignOverviewContent() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['campaigns', 'overview'],
    queryFn: () => getCampaignOverview(),
  })

  const performance = useQuery({ queryKey: ['campaigns', 'performance'], queryFn: () => getCampaignPerformance() })
  const percent = (value: number, total: number) => (total > 0 ? `${Math.round((value / total) * 100)}%` : '—')

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
              <CardTitle>Delivery results</CardTitle>
            </CardHeader>
            <CardContent>
              {performance.isError ? (
                <p className="text-body-sm text-destructive">Couldn't load delivery results.</p>
              ) : performance.isPending ? (
                <Skeleton className="h-24 w-full" />
              ) : performance.data.length === 0 ? (
                <p className="py-6 text-center text-body-sm text-muted-foreground">No campaigns have been sent yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead className="text-right">Sent to</TableHead>
                      <TableHead className="text-right">Reached</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Read</TableHead>
                      <TableHead className="text-right">Held back</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.data.map((row) => (
                      <TableRow key={row.campaignId}>
                        <TableCell>
                          <Link to={`/campaigns/${row.campaignId}`} className="font-medium hover:underline">
                            {row.name}
                          </Link>
                        </TableCell>
                        <TableCell>{new Date(row.sentAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</TableCell>
                        <TableCell className="text-muted-foreground">{row.segmentName ?? 'Deleted'}</TableCell>
                        <TableCell className="text-right">{row.sentTo}</TableCell>
                        <TableCell className="text-right">
                          {row.reached} <span className="text-muted-foreground">({percent(row.reached, row.sentTo)})</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {row.delivered} <span className="text-muted-foreground">({percent(row.delivered, row.sentTo)})</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {row.read} <span className="text-muted-foreground">({percent(row.read, row.sentTo)})</span>
                        </TableCell>
                        <TableCell className="text-right">{row.heldBack}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p className="mt-3 text-caption text-muted-foreground">
                Delivery is simulated — no messaging provider is connected. Clicks and coupon redemptions will appear
                once a provider and the POS are connected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaigns Module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/campaigns/all" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <List className="size-4" />
                All Campaigns
              </Link>
              <Link to="/campaigns/calendar" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                <CalendarDays className="size-4" />
                Calendar
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
