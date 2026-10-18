import { Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'

/** Mobile Marketing Analytics — static placeholder only, per approved decision 2. */
export function MobileMarketingAnalyticsContent() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Marketing</h2>

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Megaphone className="size-8" />
          <p className="max-w-xs text-body-sm">
            Marketing analytics is not yet available — no campaign data model exists yet.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
