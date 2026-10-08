import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundScreen } from '@/layouts/NotFoundScreen'
import { DashboardScreen } from '@/features/dashboard'

/**
 * Router infrastructure — docs/FRONTEND_ARCHITECTURE.md §9. The data
 * router API is used (not plain <Routes> JSX) so later feature routes can
 * use route-level code-splitting (`lazy`) from the start.
 *
 * Dashboard (docs/NAVIGATION.md §7) is the first real CRM feature, so the
 * index route now redirects to it rather than showing a placeholder. No
 * other per-module routes (/customers, /orders, ...) are added here. Those
 * arrive module-by-module in their own future phases, one hamburger/
 * sidebar section at a time, per docs/NAVIGATION.md §33 and
 * docs/CLAUDE.md §11.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
