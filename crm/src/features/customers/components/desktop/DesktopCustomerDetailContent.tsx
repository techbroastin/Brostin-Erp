import type { ReactNode } from 'react'
import { Phone, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

/**
 * shadcn's CardTitle renders a plain <div>, not a heading element, so it
 * can't be used for real section headings without losing semantic
 * structure (docs/DESKTOP_UI_SPEC.md §22). This matches CardTitle's own
 * visual style without modifying the generated primitive.
 */
function CardSectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-base leading-snug font-medium">{children}</h2>
}

/**
 * docs/DESKTOP_UI_SPEC.md — denser two-column profile/summary, same
 * placeholder-section technique as the mobile detail and Dashboard.
 * Customer 360 exact layout is NOT YET FINALIZED — only currently-defined
 * information is shown.
 */
export function DesktopCustomerDetailContent({
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">{customer.name}</h1>
      </div>

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
                <p className="text-label text-muted-foreground">Loyalty points</p>
                <p className="text-h3 font-semibold">{customer.loyaltyPoints ?? '—'}</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">Last order</p>
                <p className="text-h3 font-semibold">
                  {customer.lastOrderAt
                    ? new Date(customer.lastOrderAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['Orders', 'Loyalty', 'Feedback', 'Activity'] as const).map((section) => (
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
      </div>
    </div>
  )
}
