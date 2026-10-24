import { Link } from 'react-router-dom'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'

/**
 * Desktop top header — docs/DESKTOP_UI_SPEC.md §6, styled after the
 * owner's desktop UI reference. Global search is still a placeholder
 * (feature work, not shell work). The bell shows the open-alert count
 * and opens the dashboard. There is no sign-in yet, so the profile chip
 * shows the same demo identity the Audit Log records (Arjun Nair, Owner).
 */
export function DesktopTopHeader() {
  const { data } = useDashboardSummary()
  const alertCount = data?.alerts.length ?? 0

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/70 bg-background px-6">
      <div className="flex w-full max-w-md items-center gap-2.5 rounded-xl bg-canvas px-4 py-2.5 text-muted-foreground">
        <Search className="size-4 shrink-0" />
        <span className="text-body-sm">Search customers, orders, campaigns…</span>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <Link
          to="/dashboard"
          aria-label={alertCount > 0 ? `${alertCount} open alerts` : 'No open alerts'}
          className="relative rounded-full p-1.5 text-foreground/80 hover:bg-canvas"
        >
          <Bell className="size-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-brand-primary text-[0.65rem] font-semibold text-white">
              {alertCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-primary text-body font-semibold text-white">
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-body-sm font-semibold">Arjun Nair</span>
            <span className="text-caption text-muted-foreground">Owner · demo</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
