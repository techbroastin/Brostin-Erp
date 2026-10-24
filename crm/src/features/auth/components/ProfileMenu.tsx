import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useCurrentUser, useSignOut } from '@/features/auth/hooks/useAuth'
import { ROLE_LABELS } from '@/features/settings/types/settings'
import { can } from '@/features/settings/utils/permissions'

/**
 * Desktop header profile menu — docs/DESKTOP_UI_SPEC.md §6 "user/profile
 * menu (account, settings shortcut, logout)". The account block shows
 * who is signed in and their role; Settings appears only for roles that
 * can open it. Closes on outside click and Escape.
 */
export function ProfileMenu() {
  const user = useCurrentUser()
  const signOut = useSignOut()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const role = ROLE_LABELS[user.role]

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-primary text-body font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span className="text-body-sm font-semibold">{user.name}</span>
          <span className="text-caption text-muted-foreground">{role} · demo</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
        >
          <div className="flex items-start gap-2.5 px-2.5 py-2">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold">{user.name}</p>
              <p className="truncate text-caption text-muted-foreground">{user.email}</p>
              <p className="text-caption text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          {can(user.role, 'settings', 'view') && (
            <Link
              role="menuitem"
              to="/settings/general"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-body-sm hover:bg-muted"
            >
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body-sm hover:bg-muted"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
