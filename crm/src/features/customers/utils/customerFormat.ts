const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

/**
 * Formats a YYYY-MM-DD calendar date (birthday, anniversary) without a
 * UTC round-trip, so the day never shifts with the viewer's timezone.
 */
export function formatCalendarDate(value: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', DATE_FORMAT)
}

export function formatTimestampDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', DATE_FORMAT)
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
