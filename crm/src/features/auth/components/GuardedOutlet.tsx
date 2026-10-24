import { Link, Outlet, useLocation } from 'react-router-dom'
import { Eye, Lock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { EDITABLE_AREAS, accessFor, areaForPath, isEditorPath } from '@/features/auth/utils/access'
import { ROLE_LABELS } from '@/features/settings/types/settings'
import { PERMISSION_AREA_LABELS } from '@/features/settings/utils/permissions'
import { cn } from '@/lib/utils'

/**
 * The page outlet both shells render, checked against the signed-in
 * role (Book 3 §14 matrix). No access → a clear "no access" screen even
 * when the URL is typed directly, so hiding the menu item is never the
 * only barrier. View-only access → a notice above the page; the
 * services themselves refuse any change (authService.requirePermission).
 */
export function GuardedOutlet({ className }: { className?: string }) {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  if (!user) return null

  const access = accessFor(user.role, pathname)
  const area = areaForPath(pathname)
  const role = ROLE_LABELS[user.role]

  if (access === 'none') {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center gap-3 p-6 text-center', className)}>
        <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-h2 font-semibold">No access</h1>
        <p className="max-w-sm text-body text-muted-foreground">
          Your role ({role}) can't {isEditorPath(pathname) ? 'make changes in' : 'open'}{' '}
          {area ? PERMISSION_AREA_LABELS[area] : 'this page'}. Ask an Owner if you need it.
        </p>
        <Link to="/dashboard" className={buttonVariants({ variant: 'default' })}>
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <>
      {access === 'view' && area && EDITABLE_AREAS.has(area) && (
        <p
          role="note"
          className={cn(
            'flex items-start gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-body-sm text-muted-foreground',
            className,
          )}
        >
          <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          View only — your role ({role}) can see {PERMISSION_AREA_LABELS[area]} but not change it.
        </p>
      )}
      <Outlet />
    </>
  )
}
