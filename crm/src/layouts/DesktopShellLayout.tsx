import { Outlet } from 'react-router-dom'
import { DesktopSidebar } from '@/components/desktop/DesktopSidebar'
import { DesktopTopHeader } from '@/components/desktop/DesktopTopHeader'

/**
 * Desktop Admin shell — docs/DESKTOP_UI_SPEC.md §4. Composes DesktopSidebar
 * + DesktopTopHeader + a content outlet, fixed two-pane structure.
 * Structurally independent from MobileShellLayout; shares no layout
 * component with it. Never collapses into a mobile-style layout.
 */
export function DesktopShellLayout() {
  return (
    <div className="flex h-dvh bg-canvas">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopTopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
