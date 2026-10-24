import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, Gift, House, LayoutGrid, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { accessFor } from '@/features/auth/utils/access'

/**
 * Mobile bottom tab bar — owner-approved (docs/NAVIGATION.md §25 named
 * these candidates; added on request to match the mobile UI reference).
 * Home, Customers, Orders and Loyalty are direct tabs; More opens the
 * full hamburger menu, which stays the complete navigation. Mobile-only.
 */
const TABS = [
  { label: 'Home', path: '/dashboard', icon: House },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Loyalty', path: '/loyalty', icon: Gift },
] as const

export function MobileBottomNav({ onMoreClick, moreOpen }: { onMoreClick: () => void; moreOpen: boolean }) {
  const { pathname } = useLocation()
  const user = useCurrentUser()
  // Tabs a role can't open are left out (e.g. Orders for a Marketing Operator).
  const tabs = TABS.filter((t) => user && accessFor(user.role, t.path) !== 'none')
  const tabActive = tabs.some((t) => pathname.startsWith(t.path))

  const itemClass = (active: boolean) =>
    cn(
      'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium',
      active ? 'text-brand-primary' : 'text-muted-foreground',
    )

  return (
    <nav
      aria-label="Quick navigation"
      className="shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(16,24,40,0.05)]"
    >
      <ul className="flex">
        {tabs.map(({ label, path, icon: Icon }) => {
          const active = pathname.startsWith(path)
          return (
            <li key={path} className="flex flex-1">
              <Link to={path} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
                <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', active && 'bg-brand-primary-soft')}>
                  <Icon className="size-5" />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMoreClick} aria-expanded={moreOpen} className={itemClass(moreOpen || !tabActive)}>
            <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', (moreOpen || !tabActive) && 'bg-brand-primary-soft')}>
              <LayoutGrid className="size-5" />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}
