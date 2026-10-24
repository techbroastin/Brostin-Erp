/** Book 3 §10: membership is recalculated nightly, so say when it last ran. */
export function formatLastCalculated(lastCalculatedAt: string | null): string {
  if (!lastCalculatedAt) return 'Pending nightly recalculation'
  const formatted = new Date(lastCalculatedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `Calculated ${formatted}`
}
