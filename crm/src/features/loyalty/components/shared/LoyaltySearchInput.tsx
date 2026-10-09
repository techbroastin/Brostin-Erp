import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * Single reusable search input shared by Customer Balances and Activity
 * (docs/MOBILE_UI_SPEC.md §25 / docs/DESKTOP_UI_SPEC.md §10 pattern) —
 * identical in shape to CustomerSearchInput/OrderSearchInput, just
 * parametrized since the two screens search different fields.
 */
export function LoyaltySearchInput({
  value,
  onChange,
  id,
  label,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  id: string
  label: string
  placeholder: string
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
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
