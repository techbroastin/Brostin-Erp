import { Phone, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CustomerTimeline } from '@/features/customers/components/shared/CustomerTimeline'
import { CustomerProfileDetails } from '@/features/customers/components/shared/CustomerProfileDetails'
import { CustomerArchiveControl } from '@/features/customers/components/shared/CustomerArchiveControl'
import type { Customer } from '@/features/customers/types/customer'
import { formatRupees, formatTimestampDate } from '@/features/customers/utils/customerFormat'

/**
 * docs/MOBILE_UI_SPEC.md §13 detail sequence: Profile → Summary → Orders
 * → Loyalty → Feedback → Activity. Orders/Loyalty/Feedback remain
 * placeholders — those modules don't exist yet (same technique as
 * Dashboard's "Loyalty lands with the Loyalty module" placeholder).
 * "Activity" is now the real Book 3 §5 Customer Timeline — a vertical
 * list, per docs/MOBILE_UI_SPEC.md §14's "do not reproduce a desktop
 * CRM table" rule. Customer 360 exact layout is NOT YET FINALIZED per
 * docs/NAVIGATION.md §8.2 / docs/MOBILE_UI_SPEC.md §14 — only
 * currently-defined information is shown.
 */
export function MobileCustomerDetailContent({
  customer,
}: { customer: Customer }) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-1">
        {/* h2, not h1 — MobileHeader already renders this screen's page h1. */}
        <h2 className="text-page-title font-semibold">{customer.name}</h2>
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
        {customer.archivedAt && (
          <div className="mt-2">
            <CustomerArchiveControl customer={customer} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent>
              <p className="text-label text-muted-foreground">Orders</p>
              <p className="text-h3 font-semibold">{customer.orderCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-label text-muted-foreground">Lifetime spend</p>
              <p className="text-h3 font-semibold">{formatRupees(customer.lifetimeSpend)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-label text-muted-foreground">Loyalty points</p>
              <p className="text-h3 font-semibold">{customer.loyaltyPoints ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-label text-muted-foreground">First visit</p>
              <p className="text-h3 font-semibold">{formatTimestampDate(customer.firstVisitAt)}</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-body-sm text-muted-foreground">
          {customer.lastOrderAt
            ? `Last order ${formatTimestampDate(customer.lastOrderAt)}`
            : 'No orders yet'}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Profile</h2>
        <Card>
          <CardContent>
            <CustomerProfileDetails customer={customer} />
          </CardContent>
        </Card>
      </section>

      {(['Orders', 'Loyalty', 'Feedback'] as const).map((section) => (
        <section key={section} className="flex flex-col gap-2">
          <h2 className="text-section-title font-semibold">{section}</h2>
          <Card>
            <CardContent>
              <p className="text-body-sm text-muted-foreground">
                {section} lands with the {section} module.
              </p>
            </CardContent>
          </Card>
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-section-title font-semibold">Activity</h2>
        <Card>
          <CardContent>
            <CustomerTimeline customerId={customer.id} customerName={customer.name} />
          </CardContent>
        </Card>
      </section>
      {!customer.archivedAt && <CustomerArchiveControl customer={customer} />}
    </div>
  )
}
