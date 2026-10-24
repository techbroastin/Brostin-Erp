import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileHamburgerMenu } from '@/components/mobile/MobileHamburgerMenu'
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav'
import { navigationModules } from '@/app/navigation'

/**
 * Mobile Manager shell — docs/MOBILE_UI_SPEC.md. Composes MobileHeader +
 * MobileHamburgerMenu + a content outlet + the owner-approved bottom tab
 * bar (whose "More" opens the hamburger menu). Structurally independent
 * from DesktopShellLayout; shares no layout component with it.
 */
export function MobileShellLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const activeModule = navigationModules.find((module) =>
    location.pathname.startsWith(module.path),
  )
  const title = activeModule?.label ?? 'Broastin'

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <MobileHeader
        title={title}
        isHome={activeModule?.id === 'dashboard'}
        onMenuClick={() => setMenuOpen(true)}
      />
      <MobileHamburgerMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <MobileBottomNav moreOpen={menuOpen} onMoreClick={() => setMenuOpen(true)} />
    </div>
  )
}
