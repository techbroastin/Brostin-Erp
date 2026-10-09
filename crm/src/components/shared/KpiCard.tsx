import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type KpiCardData = {
  id: string
  label: string
  value: string
  trend?: 'up' | 'down' | 'flat'
  trendLabel?: string
}

const trendConfig = {
  up: { icon: TrendingUp, className: 'text-success' },
  down: { icon: TrendingDown, className: 'text-destructive' },
  flat: { icon: Minus, className: 'text-muted-foreground' },
} as const

/**
 * docs/DESIGN_SYSTEM.md §31 — label → main value → supporting info.
 * Trend pairs an icon with text, never color alone. Shared across
 * features (Dashboard, Loyalty) per docs/FRONTEND_ARCHITECTURE.md §6.
 */
export function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const trend = kpi.trend ? trendConfig[kpi.trend] : null
  const TrendIcon = trend?.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-label font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-h3 font-semibold">{kpi.value}</p>
        {trend && TrendIcon && (
          <p className={cn('mt-1 flex items-center gap-1 text-caption', trend.className)}>
            <TrendIcon className="size-3.5" />
            {kpi.trendLabel ?? kpi.trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-3.5 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-16" />
      </CardContent>
    </Card>
  )
}
