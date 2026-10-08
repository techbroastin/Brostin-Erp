import { Users, SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Two distinct empty states, per explicit instruction: a genuinely empty
 * customer database vs a search that returned no results.
 */
export function CustomerEmptyState({
  search,
  onClearSearch,
}: {
  search: string
  onClearSearch: () => void
}) {
  if (search) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <div>
          <p className="text-body font-medium">No customers match "{search}"</p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Try a different name or phone number.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearSearch}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Clear search
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Users className="size-8 text-muted-foreground" />
      <p className="text-body font-medium">No customers yet.</p>
    </div>
  )
}
