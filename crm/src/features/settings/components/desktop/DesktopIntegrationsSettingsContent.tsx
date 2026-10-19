import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { integrationStatuses } from '@/features/settings/mock/settings.mock'

/**
 * Desktop Integrations — static status rows only. Per
 * docs/NAVIGATION.md §18: "Do not invent integration settings before
 * the integration is defined." No configuration controls exist.
 */
export function DesktopIntegrationsSettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Integrations</h1>
        <DemoDataBadge />
      </div>

      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-2">
          {integrationStatuses.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between text-body-sm">
              <span className="font-medium">{integration.name}</span>
              <span className="text-muted-foreground">Not yet connected</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
