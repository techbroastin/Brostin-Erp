import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown while a lazy route's chunk is still being fetched on the very
 * first navigation — without this, React Router leaves the screen blank
 * during that fetch. Minimal and shell-agnostic since it renders before
 * RootLayout's mobile/desktop split is even relevant.
 */
export function RouteHydrateFallback() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Skeleton className="h-8 w-32" />
    </div>
  )
}
