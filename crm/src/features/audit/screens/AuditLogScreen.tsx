import { Monitor } from 'lucide-react'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { DesktopAuditLogContent } from '@/features/audit/components/desktop/DesktopAuditLogContent'

/**
 * Audit Log route element — /settings/audit. Desktop Admin only: mobile
 * Settings is deliberately limited (docs/NAVIGATION.md §19).
 */
export function AuditLogScreen() {
  const isDesktop = useIsDesktopViewport()
  if (isDesktop) return <DesktopAuditLogContent />
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          The Audit Log is part of Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}
