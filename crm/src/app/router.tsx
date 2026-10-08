import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundScreen } from '@/layouts/NotFoundScreen'
import { RouteHydrateFallback } from '@/app/RouteHydrateFallback'

/**
 * Router infrastructure — docs/FRONTEND_ARCHITECTURE.md §9: "Route-level
 * screens are code-split (lazy-loaded) per feature." Dashboard, Customers
 * list and Customer detail use React Router's `lazy` route property
 * (data router API) so each resolves to its own chunk only when
 * navigated to — a Phase 4 correction; Phase 3 shipped Dashboard as an
 * eager import, which this fixes without touching the Phase 3 commit.
 *
 * No other per-module routes (/orders, /loyalty, ...) are added here.
 * Those arrive module-by-module in their own future phases, one
 * hamburger/sidebar section at a time, per docs/NAVIGATION.md §33 and
 * docs/CLAUDE.md §11.
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
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
