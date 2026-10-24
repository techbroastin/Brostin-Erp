import { Phone, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { CustomerTimeline } from '@/features/customers/components/shared/CustomerTimeline'
import { CustomerProfileDetails } from '@/features/customers/components/shared/CustomerProfileDetails'
import { CustomerArchiveControl } from '@/features/customers/components/shared/CustomerArchiveControl'
import type { Customer } from '@/features/customers/types/customer'
import { formatRupees, formatTimestampDate } from '@/features/customers/utils/customerFormat'

/**
 * docs/DESKTOP_UI_SPEC.md — denser two-column profile/summary, same
 * placeholder-section technique as the mobile detail and Dashboard.
 * Customer 360 exact layout is NOT YET FINALIZED — only currently-defined
 * information is shown. "Activity" is now the real Book 3 §5 Customer
 * Timeline; Orders/Loyalty/Feedback remain placeholders — out of scope
 * for this phase.
 */
export function DesktopCustomerDetailContent({
  customer,
}: { customer: Customer }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-page-title font-semibold">{customer.name}</h1>
        {!customer.archivedAt && <CustomerArchiveControl customer={customer} />}
      </div>
      {customer.archivedAt && <CustomerArchiveControl customer={customer} />}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardSectionHeading>Profile</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-body text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              {customer.phone}
            </p>
            {customer.alert && (
              <p className="mt-1 flex items-center gap-1.5 text-body-sm text-warning">
                <AlertCircle className="size-4 shrink-0" />
                {customer.alert}
              </p>
            )}
            <div className="mt-3">
              <CustomerProfileDetails customer={customer} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardSectionHeading>Summary</CardSectionHeading>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-label text-muted-foreground">Orders</p>
                <p className="text-h3 font-semibold">{customer.orderCount}</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">Lifetime spend</p>
                <p className="text-h3 font-semibold">{formatRupees(customer.lifetimeSpend)}</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">Loyalty points</p>
                <p className="text-h3 font-semibold">{customer.loyaltyPoints ?? '—'}</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">First visit</p>
                <p className="text-h3 font-semibold">{formatTimestampDate(customer.firstVisitAt)}</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">Last order</p>
                <p className="text-h3 font-semibold">{formatTimestampDate(customer.lastOrderAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['Orders', 'Loyalty', 'Feedback'] as const).map((section) => (
          <Card key={section}>
            <CardHeader>
              <CardSectionHeading>{section}</CardSectionHeading>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-muted-foreground">
                {section} lands with the {section} module.
              </p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardSectionHeading>Activity</CardSectionHeading>
          </CardHeader>
          <CardContent>
            <CustomerTimeline customerId={customer.id} customerName={customer.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
