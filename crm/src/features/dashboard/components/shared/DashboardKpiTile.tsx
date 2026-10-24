import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus, ShoppingCart, Users, Wallet, type LucideIcon } from 'lucide-react'
import type { DashboardKpi } from '@/features/dashboard/types/dashboard'
import { cn } from '@/lib/utils'

/**
 * One dashboard KPI in the reference-image style (round coloured icon,
 * bold value, trend). Content is the existing dashboard KPI — only the
 * look comes from the reference images.
 */
const ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  'orders-today': { icon: ShoppingCart, className: 'bg-brand-accent text-brand-accent-foreground' },
  'revenue-today': { icon: Wallet, className: 'bg-brand-accent text-brand-accent-foreground' },
  'new-customers': { icon: Users, className: 'bg-brand-primary-soft text-brand-primary' },
  'active-alerts': { icon: AlertTriangle, className: 'bg-brand-primary text-white' },
}

const TREND = {
  up: { icon: ArrowUpRight, className: 'text-success' },
  down: { icon: ArrowDownRight, className: 'text-destructive' },
  flat: { icon: Minus, className: 'text-muted-foreground' },
} as const

export function DashboardKpiTile({ kpi, compact = false }: { kpi: DashboardKpi; compact?: boolean }) {
  const { icon: Icon, className } = ICONS[kpi.id] ?? ICONS['orders-today']
  const trend = kpi.trend ? TREND[kpi.trend] : null
  const TrendIcon = trend?.icon

  const body = (
    <>
      <span className={cn('flex shrink-0 items-center justify-center rounded-full', compact ? 'size-8' : 'size-11', className)}>
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={cn('truncate text-muted-foreground', compact ? 'text-caption' : 'text-body-sm')}>{kpi.label}</span>
        <span className={cn('font-extrabold', compact ? 'text-section-title' : 'text-h3')}>{kpi.value}</span>
        {trend && TrendIcon && (
          <span className={cn('flex items-center gap-1 text-caption', trend.className)}>
            <TrendIcon className="size-3.5" />
            {kpi.trendLabel}
          </span>
        )}
      </span>
    </>
  )

  const tileClass = cn(
    'flex rounded-2xl bg-card text-foreground shadow-[0_1px_3px_rgba(16,24,40,0.06)]',
    compact ? 'min-h-28 flex-col gap-1.5 p-3' : 'items-center gap-3.5 p-4',
  )

  return kpi.href ? (
    <Link
      to={kpi.href}
      className={cn(tileClass, 'transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      {body}
    </Link>
  ) : (
    <div className={tileClass}>{body}</div>
  )
}
