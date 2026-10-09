import { ClipboardList, SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Three distinct empty states: a genuinely empty order list, a search
 * that returned no results, and a filter combination (status/source on
 * desktop) that returned no results with no search term — these must
 * stay distinct so "No orders yet." never appears when orders exist but
 * none match the current filters.
 */
export function OrderEmptyState({
  search,
  hasOtherFilters = false,
  onClear,
}: {
  search: string
  hasOtherFilters?: boolean
  onClear: () => void
}) {
  if (search) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <div>
          <p className="text-body font-medium">No orders match "{search}"</p>
          <p className="mt-1 text-body-sm text-muted-foreground">Try a different order number.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Clear search
        </button>
      </div>
    )
  }

  if (hasOtherFilters) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <div>
          <p className="text-body font-medium">No orders match the selected filters.</p>
          <p className="mt-1 text-body-sm text-muted-foreground">Try different filter options.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <ClipboardList className="size-8 text-muted-foreground" />
      <p className="text-body font-medium">No orders yet.</p>
    </div>
  )
}
