import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { navigationModules } from '@/app/navigation'
import { cn } from '@/lib/utils'

/**
 * Mobile hamburger drawer content — docs/MOBILE_UI_SPEC.md §8. Lists only
 * `mobileVisible` modules from the single shared navigation definition
 * (Campaigns and Automation are excluded here, never by a separate list).
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
  const mobileModules = navigationModules.filter((module) => module.mobileVisible)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-3/4 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-section-title font-semibold tracking-tight">
            Broastin
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
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium',
                      isActive
                        ? 'bg-brand-primary-soft text-brand-primary'
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
