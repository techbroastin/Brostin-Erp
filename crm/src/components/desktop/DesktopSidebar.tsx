import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { BrandMark } from '@/components/shared/BrandMark'
import { navigationModules } from '@/app/navigation'
import { cn } from '@/lib/utils'

/**
 * Persistent desktop sidebar — docs/DESKTOP_UI_SPEC.md §5. Shows the full,
 * unfiltered module list from the single shared navigation definition
 * (unlike the mobile hamburger menu, nothing is trimmed here). Desktop-only;
 * never imported by mobile files. Does not collapse into a hamburger menu.
 */
export function DesktopSidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-brand-primary text-white">
      <div className="px-5 py-5">
        <BrandMark className="text-white" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="flex flex-col gap-1">
          {navigationModules.map((module) => {
            const isActive = location.pathname.startsWith(module.path)
            const Icon = module.icon
            return (
              <li key={module.id}>
                <Link
                  to={module.path}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium text-white/80',
                    isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {module.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/15 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body font-medium text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4.5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
