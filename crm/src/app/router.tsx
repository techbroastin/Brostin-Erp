import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundScreen } from '@/layouts/NotFoundScreen'
import { RouteHydrateFallback } from '@/app/RouteHydrateFallback'

/**
 * Router infrastructure — docs/FRONTEND_ARCHITECTURE.md §9: "Route-level
 * screens are code-split (lazy-loaded) per feature." Dashboard, Customers
 * (list/detail), Orders (list/detail) and Loyalty (overview/customers/
 * rewards/activity) all use React Router's `lazy` route property (data
 * router API) so each resolves to its own chunk only when navigated to.
 *
 * All four Loyalty routes are implemented together in Phase 6, unlike
 * Orders/Customers: docs/IMPLEMENTATION_PLAN.md §12 names all of
 * "loyalty overview, customer points/balance, rewards, activity" with no
 * exclusion, mapping 1:1 onto docs/NAVIGATION.md §10's four routes.
 *
 * No other per-module routes (/campaigns, /feedback, ...) are added
 * here. Those arrive module-by-module in their own future phases, one
 * hamburger/sidebar section at a time, per docs/NAVIGATION.md §33 and
 * docs/CLAUDE.md §11. /orders/today is explicitly excluded from Phase 5
 * — not named as a Phase 8 deliverable in docs/IMPLEMENTATION_PLAN.md.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    hydrateFallbackElement: <RouteHydrateFallback />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        lazy: async () => {
          const { DashboardScreen } = await import('@/features/dashboard')
          return { Component: DashboardScreen }
        },
      },
      {
        path: 'customers',
        lazy: async () => {
          const { CustomersListScreen } = await import('@/features/customers')
          return { Component: CustomersListScreen }
        },
      },
      {
        path: 'customers/:customerId',
        lazy: async () => {
          const { CustomerDetailScreen } = await import('@/features/customers')
          return { Component: CustomerDetailScreen }
        },
      },
      {
        path: 'orders',
        lazy: async () => {
          const { OrdersListScreen } = await import('@/features/orders')
          return { Component: OrdersListScreen }
        },
      },
      {
        path: 'orders/:orderId',
        lazy: async () => {
          const { OrderDetailScreen } = await import('@/features/orders')
          return { Component: OrderDetailScreen }
        },
      },
      {
        path: 'loyalty',
        lazy: async () => {
          const { LoyaltyOverviewScreen } = await import('@/features/loyalty')
          return { Component: LoyaltyOverviewScreen }
        },
      },
      {
        path: 'loyalty/customers',
        lazy: async () => {
          const { CustomerBalancesScreen } = await import('@/features/loyalty')
          return { Component: CustomerBalancesScreen }
        },
      },
      {
        path: 'loyalty/rewards',
        lazy: async () => {
          const { RewardsScreen } = await import('@/features/loyalty')
          return { Component: RewardsScreen }
        },
      },
      {
        path: 'loyalty/activity',
        lazy: async () => {
          const { LoyaltyActivityScreen } = await import('@/features/loyalty')
          return { Component: LoyaltyActivityScreen }
        },
      },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
