import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'

/**
 * Mobile QR Settings — same static, read-only placeholder as
 * DesktopQrSettingsContent; see that file for the full rationale. h2,
 * not h1 — MobileHeader already renders this screen's page h1.
 */
export function MobileQrSettingsContent() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Settings</h2>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <SettingsIcon className="size-8 text-muted-foreground" />
          <div>
            <p className="text-body font-medium">QR configuration isn't available yet.</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              QR tokens and table assignments are managed by the existing QR Ordering system and
              are not editable from this interface.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
