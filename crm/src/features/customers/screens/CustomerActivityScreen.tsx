import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, History, MessageSquare, ShoppingBag, Star, StickyNote } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useCustomerActivity } from '@/features/customers/hooks/useCustomerTimeline'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import type { CustomerTimelineEventFilter, CustomerTimelineEventType } from '@/features/customers/types/customerTimeline'
import { cn } from '@/lib/utils'

const PAGE_STEP = 30

const FILTERS: { value: CustomerTimelineEventFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'visit', label: 'Visits' },
  { value: 'points', label: 'Points' },
  { value: 'review', label: 'Reviews' },
  { value: 'note', label: 'Notes' },
]

const TYPE_ICONS: Record<CustomerTimelineEventType, typeof ShoppingBag> = {
  visit: ShoppingBag,
  points: Gift,
  review: Star,
  message: MessageSquare,
  note: StickyNote,
}

/**
 * Customer Activity — docs/NAVIGATION.md §8.6: an activity list across
 * customers (orders, loyalty, feedback, notes), newest first, filterable
 * by type. Uses the same events as each customer's Book 3 §5 timeline,
 * so the two always agree. List-shaped on both phone and desktop, like
 * the timeline itself; read-only (the timeline is append-only).
 */
export function CustomerActivityScreen() {
  const isDesktop = useIsDesktopViewport()
  const [type, setType] = useState<CustomerTimelineEventFilter>('all')
  const [limit, setLimit] = useState(PAGE_STEP)
  const { data, isPending, isError, isFetching, refetch } = useCustomerActivity(type, limit)
  const events = data ?? []

  return (
    <div className={cn('flex flex-col gap-4', !isDesktop && 'p-4')}>
      <div className="flex items-center justify-between gap-2">
        {isDesktop ? (
          <h1 className="text-page-title font-semibold">Customer Activity</h1>
        ) : (
          <h2 className="text-section-title font-semibold">Customer Activity</h2>
        )}
        <DemoDataBadge />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by activity type">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={type === f.value}
            onClick={() => {
              setType(f.value)
              setLimit(PAGE_STEP)
            }}
            className={cn(
              'min-h-9 rounded-full px-4 text-body-sm font-medium',
              type === f.value ? 'bg-brand-primary text-white' : 'bg-card text-foreground shadow-[0_1px_3px_rgba(16,24,40,0.06)]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <CustomerErrorState onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <History className="size-8" />
          <p className="text-body font-medium text-foreground">No activity of this type yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => {
            const Icon = TYPE_ICONS[e.type]
            return (
              <li key={e.id} className="flex items-start gap-3 rounded-2xl bg-card p-3.5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-body-sm font-semibold">
                      {e.href ? (
                        <Link to={e.href} className="hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        e.title
                      )}
                    </p>
                    <span className="shrink-0 text-caption text-muted-foreground">
                      {new Date(e.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <Link to={`/customers/${e.customerId}`} className="text-caption font-medium text-brand-primary hover:underline">
                    {e.customerName}
                  </Link>
                  {e.detail && <p className="mt-0.5 line-clamp-2 text-caption text-muted-foreground">{e.detail}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {events.length >= limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE_STEP)}
          disabled={isFetching}
          className={cn(buttonVariants({ variant: 'outline' }), 'self-center')}
        >
          {isFetching ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
