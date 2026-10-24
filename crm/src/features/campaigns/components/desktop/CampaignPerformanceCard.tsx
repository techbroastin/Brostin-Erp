import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { getCampaignDelivery } from '@/features/campaigns/services/campaignService'
import type { CampaignSummary } from '@/features/campaigns/types/campaign'

/**
 * Book 3 §4 campaign performance for one campaign: the delivery funnel
 * from the Message Log. Opens/clicks/redemptions aren't tracked until a
 * provider and the POS are connected, and the card says so.
 */
export function CampaignPerformanceCard({ campaign }: { campaign: CampaignSummary }) {
  const { data: funnel, isPending } = useQuery({
    queryKey: ['campaigns', 'delivery', campaign.id, campaign.status],
    queryFn: () => getCampaignDelivery(campaign.id),
    enabled: campaign.status === 'sent',
  })

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>Performance</CardSectionHeading>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 text-body-sm">
        {campaign.status !== 'sent' ? (
          <p className="text-muted-foreground">Results appear here after the campaign is sent.</p>
        ) : isPending ? (
          <p className="text-muted-foreground">Loading results…</p>
        ) : !funnel ? (
          <p className="text-muted-foreground">No delivery records for this campaign.</p>
        ) : (
          <>
            {[
              ['Sent to', funnel.total],
              ['Reached', funnel.reached],
              ['Delivered', funnel.delivered],
              ['Read', funnel.read],
              ['Held back', funnel.blocked + funnel.logOnly],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">
                  {value}
                  {label !== 'Sent to' && funnel.total > 0 && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({Math.round((Number(value) / funnel.total) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
            ))}
            <p className="mt-1 text-caption text-muted-foreground">
              Simulated delivery. Clicks and coupon redemptions will show once a provider and the POS are connected.{' '}
              <Link to="/campaigns/messages" className="underline underline-offset-2">
                Message Log
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
