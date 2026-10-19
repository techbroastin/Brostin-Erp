import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ROLE_LABELS } from '@/features/settings/types/settings'

/**
 * Desktop Roles & Access — illustrative role labels only. No
 * permission matrix exists (docs/NAVIGATION.md §18: "exact permission
 * matrix NOT YET FINALIZED") and none is enforced here. No editable
 * permission control exists on this page.
 */
export function DesktopRolesSettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Roles &amp; Access</h1>
        <DemoDataBadge />
      </div>

      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-3">
          <p className="text-body-sm text-muted-foreground">
            Access enforcement is not implemented yet. The roles below are illustrative labels only
            — they do not grant or restrict access to anything in this application.
          </p>
          <div className="flex flex-col gap-1.5">
            {Object.values(ROLE_LABELS).map((label) => (
              <p key={label} className="text-body-sm font-medium">
                {label}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
