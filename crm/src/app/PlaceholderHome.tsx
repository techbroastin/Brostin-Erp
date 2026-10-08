/**
 * Temporary index-route element proving both shells mount correctly.
 * Explicitly NOT the Dashboard — replaced once Phase 3 builds the real
 * Dashboard module.
 */
export function PlaceholderHome() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-h3 font-semibold">Broastin CRM / Growth OS</h2>
      <p className="text-body text-muted-foreground">Shell foundation ready — no modules built yet.</p>
    </div>
  )
}
