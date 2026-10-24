import { Monitor } from 'lucide-react'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { DesktopDuplicatesContent } from '@/features/customers/components/desktop/DesktopDuplicatesContent'
import { DesktopMergeContent } from '@/features/customers/components/desktop/DesktopMergeContent'
import { DesktopImportContent } from '@/features/customers/components/desktop/DesktopImportContent'

/**
 * Book 3 §1 Merge Tool and Bulk Import are bulk/admin work, so they're
 * Desktop Admin only (docs/CLAUDE.md §8). Archiving works on the phone.
 */
function CustomerToolsDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          Merging and importing customers is done from Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}

/** /customers/duplicates */
export function CustomerDuplicatesScreen() {
  return useIsDesktopViewport() ? <DesktopDuplicatesContent /> : <CustomerToolsDesktopOnlyNotice />
}

/** /customers/merge?primary=…&secondary=… */
export function CustomerMergeScreen() {
  return useIsDesktopViewport() ? <DesktopMergeContent /> : <CustomerToolsDesktopOnlyNotice />
}

/** /customers/import */
export function CustomerImportScreen() {
  return useIsDesktopViewport() ? <DesktopImportContent /> : <CustomerToolsDesktopOnlyNotice />
}
