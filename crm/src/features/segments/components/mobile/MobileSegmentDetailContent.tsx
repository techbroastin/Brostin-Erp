import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SegmentKindBadge, SegmentRuleList } from '@/features/segments/components/shared/SegmentParts'
import { formatLastCalculated } from '@/features/segments/utils/segmentFormat'
import { formatRupees } from '@/features/customers/utils/customerFormat'
import type { SegmentDetail } from '@/features/segments/types/segment'

/** Mobile Segment Membership — rules, then who is in it. Read-only. */
export function MobileSegmentDetailContent({ detail }: { detail: SegmentDetail }) {
  const { segment, members } = detail

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-page-title font-semibold">{segment.name}</h1>
          <DemoDataBadge />
        </div>
        <div className="flex items-center gap-2">
          <SegmentKindBadge kind={segment.kind} />
          <span className="text-caption text-muted-foreground">{formatLastCalculated(segment.lastCalculatedAt)}</span>
        </div>
        {segment.description && <p className="text-body-sm text-muted-foreground">{segment.description}</p>}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Rules</h2>
        <Card>
          <CardContent>
            <SegmentRuleList segment={segment} />
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">
          Members <span className="text-muted-foreground">({members.length})</span>
        </h2>
        {members.length === 0 ? (
          <p className="py-8 text-center text-body-sm text-muted-foreground">No customers match this segment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((customer) => (
              <Link key={customer.id} to={`/customers/${customer.id}`}>
                <Card>
                  <CardContent className="flex flex-col gap-1">
                    <p className="truncate text-body font-medium">{customer.name}</p>
                    <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" />
                      {customer.phone}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {customer.orderCount} order{customer.orderCount === 1 ? '' : 's'} ·{' '}
                      {formatRupees(customer.lifetimeSpend)} spent
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
