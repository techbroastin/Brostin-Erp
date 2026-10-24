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
 *
 * Styled after the owner's desktop UI reference (red panel, yellow active
 * pill, brand footer). The menu items themselves stay the locked CRM
 * navigation (docs/NAVIGATION.md). The reference's food photo is left out
 * until a real, approved photo asset is provided.
 */
export function DesktopSidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-brand-primary to-brand-primary-deep text-white">
      <div className="px-5 pt-5 pb-6">
        <Link to="/dashboard" className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent">
          <BrandMark withLogo subtitle="Growth OS" nameClassName="text-h3 font-extrabold text-brand-accent" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label="Main">
        <ul className="flex flex-col gap-1">
          {navigationModules.map((module) => {
            const isActive = location.pathname.startsWith(module.path)
            const Icon = module.icon
            return (
              <li key={module.id}>
                <Link
                  to={module.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-body font-medium transition-colors',
                    isActive
                      ? 'bg-brand-accent text-brand-accent-foreground shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="size-[1.15rem] shrink-0" />
                  {module.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-5 pt-4 pb-3">
        <p className="text-[1.35rem] leading-[1.05] font-extrabold tracking-tight text-brand-accent uppercase">
          Good food
          <br />
          happier people
        </p>
      </div>

      <div className="border-t border-white/15 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-body font-medium text-white/85 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-[1.15rem] shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
