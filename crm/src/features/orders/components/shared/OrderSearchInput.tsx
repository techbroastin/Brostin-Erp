import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * Search by order number only — docs §9.1 approved scope. type="text" (not
 * "search") so no native browser clear icon duplicates the custom one
 * (fixed in Phase 4 for CustomerSearchInput; applied here from the start).
 */
export function OrderSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <label htmlFor="order-search" className="sr-only">
        Search orders by order number
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="order-search"
        type="text"
        placeholder="Search by order number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
