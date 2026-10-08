import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'

/**
 * App-root providers — docs/FRONTEND_ARCHITECTURE.md §8. Registered once,
 * at the root. No queries are defined yet (no Supabase connection in
 * Phase 2) — this only establishes the provider so feature hooks have
 * something to call into later. Theme/toast providers are deferred until
 * there is something to theme/toast.
 */
const queryClient = new QueryClient()

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
