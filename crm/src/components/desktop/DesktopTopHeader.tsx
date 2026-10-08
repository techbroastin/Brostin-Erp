import { Search, Bell, UserCircle } from 'lucide-react'

/**
 * Desktop top header — docs/DESKTOP_UI_SPEC.md §6. Search, notifications
 * and user-profile are non-functional placeholders in Phase 2 — wiring
 * them up is feature work, not shell work. Desktop-only.
 */
export function DesktopTopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-md border border-input px-3 py-1.5 text-muted-foreground">
        <Search className="size-4 shrink-0" />
        <span className="text-body-sm">Search</span>
      </div>

      <div className="ml-auto flex items-center gap-3 text-muted-foreground">
        <Bell className="size-5" />
        <UserCircle className="size-6" />
      </div>
    </header>
  )
}
