import { Phone, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * docs/MOBILE_UI_SPEC.md §13 detail sequence: Profile → Summary → Orders
 * → Loyalty → Feedback → Activity. Orders/Loyalty/Feedback/Activity are
 * placeholders — those modules don't exist yet (same technique as
 * Dashboard's "Loyalty lands with the Loyalty module" placeholder).
 * Customer 360 exact layout is NOT YET FINALIZED per docs/NAVIGATION.md
 * §8.2 / docs/MOBILE_UI_SPEC.md §14 — only currently-defined information
 * is shown.
 */
export function MobileCustomerDetailContent({
  customer,
}: {
  customer: {
    name: string
    phone: string
    lastOrderAt: string | null
    orderCount: number
    loyaltyPoints: number | null
    alert: string | null
  }
}) {
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
              <p className="text-label text-muted-foreground">Loyalty points</p>
              <p className="text-h3 font-semibold">{customer.loyaltyPoints ?? '—'}</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-body-sm text-muted-foreground">
          {customer.lastOrderAt
            ? `Last order ${new Date(customer.lastOrderAt).toLocaleDateString()}`
            : 'No orders yet'}
        </p>
      </section>

      {(['Orders', 'Loyalty', 'Feedback', 'Activity'] as const).map((section) => (
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
    </div>
  )
}
