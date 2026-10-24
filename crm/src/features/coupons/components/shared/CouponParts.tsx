import { NavLink } from 'react-router-dom'
import { AlertTriangle, Ban, CheckCircle2, Clock, Monitor, PackageX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { CouponStatus } from '@/features/coupons/types/coupon'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<CouponStatus, { label: string; icon: typeof Ban; className: string }> = {
  active: { label: 'Active', icon: CheckCircle2, className: 'text-success' },
  expired: { label: 'Expired', icon: Clock, className: 'text-muted-foreground' },
  used_up: { label: 'Used up', icon: PackageX, className: 'text-warning' },
  disabled: { label: 'Disabled', icon: Ban, className: 'text-destructive' },
}

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

/** Switches between the two Coupons pages: the coupon list and the Redemption Log. */
export function CouponTabs() {
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'border-b-2 px-1 pb-2 text-body-sm font-medium',
      isActive ? 'border-brand-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
    )
  return (
    <nav aria-label="Coupons sections" className="flex gap-5 border-b border-border">
      <NavLink to="/campaigns/coupons" end className={tabClass}>
        Coupons
      </NavLink>
      <NavLink to="/campaigns/coupons/redemptions" className={tabClass}>
        Redemption Log
      </NavLink>
    </nav>
  )
}

/** Mirrors the other features' error states — docs/DESIGN_SYSTEM.md §43. */
export function CouponErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <h2 className="text-section-title font-semibold">{message}</h2>
        <p className="mt-1 text-body text-muted-foreground">Something went wrong. Please try again.</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}

/** Coupons live under Campaigns, which is Desktop Admin only (docs/NAVIGATION.md §11/§19). */
export function CouponDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          Coupons are managed from Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}
