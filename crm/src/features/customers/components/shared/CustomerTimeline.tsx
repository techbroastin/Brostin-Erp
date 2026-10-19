import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Gift, MessageSquare, Star, StickyNote, History } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { useCustomerTimeline } from '@/features/customers/hooks/useCustomerTimeline'
import { timelineEventsToCsv, downloadCsv } from '@/features/customers/utils/customerTimelineCsv'
import type {
  CustomerTimelineEventFilter,
  CustomerTimelineEventType,
} from '@/features/customers/types/customerTimeline'
import { cn } from '@/lib/utils'

const FILTER_OPTIONS: { value: CustomerTimelineEventFilter; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'visit', label: 'Visits' },
  { value: 'points', label: 'Points' },
  { value: 'review', label: 'Reviews' },
  { value: 'message', label: 'Messages' },
  { value: 'note', label: 'Notes' },
]

const TYPE_ICONS: Record<CustomerTimelineEventType, typeof ShoppingBag> = {
  visit: ShoppingBag,
  points: Gift,
  review: Star,
  message: MessageSquare,
  note: StickyNote,
}

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Book 3 §5 Customer Timeline — "embedded in Customer Detail; no
 * standalone screen needed." One shared implementation for both
 * platforms: docs/MOBILE_UI_SPEC.md §14 requires a vertical
 * timeline/list on mobile, never a reproduced desktop table — this is
 * already list-shaped on both, same approach as the Dashboard's
 * shared ActivityList/AlertList.
 *
 * Append-only in the UI too: this component has no edit/delete action
 * for any event. A correction event (correctsEventId set) renders
 * alongside the event it supersedes, with the original visually
 * marked "Superseded" and struck through — never hidden or removed.
 *
 * Export is a client-side CSV download of the currently-filtered,
 * already-loaded events — no server/export endpoint exists or is
 * implied.
 */
export function CustomerTimeline({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [filter, setFilter] = useState<CustomerTimelineEventFilter>('all')
  const { data, isPending, isError, refetch } = useCustomerTimeline(customerId)

  const events = data ?? []
  const supersededIds = new Set(events.map((e) => e.correctsEventId).filter((id): id is string => !!id))
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)

  const handleExport = () => {
    const filenameSafeName = customerName.trim().replace(/\s+/g, '-').toLowerCase() || customerId
    downloadCsv(`${filenameSafeName}-timeline.csv`, timelineEventsToCsv(filtered))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          aria-label="Filter timeline by event type"
          value={filter}
          onChange={(e) => setFilter(e.target.value as CustomerTimelineEventFilter)}
          className={selectClassName}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Export CSV
        </button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-body-sm text-destructive">Couldn't load this customer's timeline.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Retry
          </button>
        </div>
      ) : isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
          <History className="size-6" />
          <p className="text-body-sm">No {filter === 'all' ? 'timeline events' : `${filter} events`} yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((event) => {
            const Icon = TYPE_ICONS[event.type]
            const superseded = supersededIds.has(event.id)
            const content = (
              <div className={cn('flex items-start gap-2.5', superseded && 'opacity-60')}>
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn('truncate text-body-sm font-medium', superseded && 'line-through')}>
                      {event.title}
                    </p>
                    {superseded && <span className="shrink-0 text-caption text-muted-foreground">Superseded</span>}
                    {event.correctsEventId && (
                      <span className="shrink-0 text-caption text-info">Correction</span>
                    )}
                  </div>
                  <p className="truncate text-caption text-muted-foreground">{event.detail}</p>
                </div>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {new Date(event.occurredAt).toLocaleDateString()}
                </span>
              </div>
            )

            return (
              <li key={event.id}>
                {event.href ? (
                  <Link to={event.href} className="block rounded-md -mx-1 px-1 py-1 hover:bg-muted">
                    {content}
                  </Link>
                ) : (
                  <div className="py-1">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
