import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * docs/MOBILE_UI_SPEC.md §25 / docs/DESKTOP_UI_SPEC.md §10 — search by
 * name or phone, with a clear action. Debouncing happens in the screen
 * via useDebouncedValue; this component is a controlled input only.
 */
export function CustomerSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <label htmlFor="customer-search" className="sr-only">
        Search customers by name or phone
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="customer-search"
        type="text"
        placeholder="Search by name or phone"
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
