import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'

/**
 * Desktop System — static placeholder only. Per docs/NAVIGATION.md
 * §18: "exact settings NOT YET FINALIZED." Nothing is invented here.
 */
export function DesktopSystemSettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">System</h1>
        <DemoDataBadge />
      </div>

      <Card className="max-w-md">
        <CardContent className="py-8 text-center text-body-sm text-muted-foreground">
          Not yet finalized.
        </CardContent>
      </Card>
    </div>
  )
}
