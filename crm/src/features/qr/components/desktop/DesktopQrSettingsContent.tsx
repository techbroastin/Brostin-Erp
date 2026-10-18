import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'

/**
 * Desktop QR Settings — docs/NAVIGATION.md §16: "exact settings NOT
 * YET FINALIZED." Real QR tokens and table↔QR mappings are never
 * exposed to any client by design (RLS on restaurant_tables allows no
 * client read at all; resolution only happens through the
 * SECURITY DEFINER resolve_dining_table() RPC — confirmed by
 * inspection of supabase_dining_repository.dart). This screen is a
 * static, read-only placeholder only — no form, no configuration, no
 * mutation action, no invented settings field.
 */
export function DesktopQrSettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Settings</h1>
        <DemoDataBadge />
      </div>

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
