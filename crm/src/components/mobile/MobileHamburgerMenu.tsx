import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { useCurrentUser, useSignOut } from '@/features/auth/hooks/useAuth'
import { visibleModules } from '@/features/auth/utils/access'
import { BrandMark } from '@/components/shared/BrandMark'
import { cn } from '@/lib/utils'

/**
 * Mobile hamburger drawer content — docs/MOBILE_UI_SPEC.md §8. Lists only
 * `mobileVisible` modules from the single shared navigation definition
 * (Campaigns and Automation are excluded here, never by a separate list)
 * that the signed-in role may open.
 * Mobile-only; never imported by desktop files.
 *
 * Opens from the left — docs/MOBILE_UI_SPEC.md §5 marks the side as NOT
 * YET FINALIZED; left is the provisional choice here.
 */
export function MobileHamburgerMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const location = useLocation()
  const user = useCurrentUser()
  const signOut = useSignOut()
  const mobileModules = (user ? visibleModules(user.role) : []).filter((module) => module.mobileVisible)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-3/4 p-0">
        <SheetHeader className="bg-gradient-to-br from-brand-primary-deep to-brand-primary text-white">
          <SheetTitle className="text-white">
            <BrandMark withLogo subtitle="Growth OS" nameClassName="text-h3 font-extrabold text-brand-accent" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {mobileModules.map((module) => {
              const isActive = location.pathname.startsWith(module.path)
              const Icon = module.icon
              return (
                <li key={module.id}>
                  <Link
                    to={module.path}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-body font-medium',
                      isActive
                        ? 'bg-brand-accent text-brand-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {module.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <SheetFooter className="border-t border-border">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              signOut()
            }}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-body font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="size-5 shrink-0" />
            Logout
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
