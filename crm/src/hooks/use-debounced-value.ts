import { useEffect, useState } from 'react'

/**
 * Standard debounce, shared across features (Customers search, Orders
 * search) — per docs/FRONTEND_ARCHITECTURE.md §6, a hook used by two or
 * more features moves to a shared location rather than being duplicated
 * or imported across feature boundaries.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
