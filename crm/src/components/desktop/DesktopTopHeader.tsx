import { Search, Bell } from 'lucide-react'
import { ProfileMenu } from '@/features/auth/components/ProfileMenu'

/**
 * Desktop top header — docs/DESKTOP_UI_SPEC.md §6, styled after the
 * owner's desktop UI reference. Search and notifications are still
 * non-functional placeholders, so neither is presented as a button.
 * The profile is the signed-in user's account menu (ProfileMenu).
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
        <ProfileMenu />
      </div>
    </header>
  )
}
