import { Monitor } from 'lucide-react'

/**
 * docs/NAVIGATION.md §11/§19: Campaigns are Desktop Admin ONLY and are
 * never linked from the Mobile Manager hamburger menu. This guards the
 * routes themselves for the case a narrow-viewport browser is navigated
 * here directly — per docs/CLAUDE.md §8, desktop-only workflows are not
 * squeezed into the mobile layout.
 */
export function CampaignDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          Campaigns are managed from Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}
