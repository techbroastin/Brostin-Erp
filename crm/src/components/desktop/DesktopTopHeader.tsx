import { Search, Bell } from 'lucide-react'

/**
 * Desktop top header — docs/DESKTOP_UI_SPEC.md §6, styled after the
 * owner's desktop UI reference. Search, notifications and the profile
 * are still non-functional placeholders (feature work, not shell work),
 * so nothing here is presented as a working button. There is no sign-in
 * yet; the profile shows the demo identity the Audit Log records.
 */
export function DesktopTopHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/70 bg-background px-6">
      <div className="flex w-full max-w-md items-center gap-2.5 rounded-xl bg-canvas px-4 py-2.5 text-muted-foreground">
        <Search className="size-4 shrink-0" />
        <span className="text-body-sm">Search</span>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <Bell className="size-5 text-foreground/70" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-primary text-body font-semibold text-white">
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-body-sm font-semibold">Arjun Nair</span>
            <span className="text-caption text-muted-foreground">Owner · demo</span>
          </span>
        </div>
      </div>
    </header>
  )
}
