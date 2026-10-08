import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundScreen } from '@/layouts/NotFoundScreen'
import { PlaceholderHome } from '@/app/PlaceholderHome'

/**
 * Router infrastructure only — docs/FRONTEND_ARCHITECTURE.md §9. The data
 * router API is used (not plain <Routes> JSX) so later feature routes can
 * use route-level code-splitting (`lazy`) from the start.
 *
 * No per-module routes (/customers, /orders, ...) are added here. Those
 * arrive module-by-module starting Phase 3, one hamburger/sidebar section
 * at a time, per docs/NAVIGATION.md §33 and docs/CLAUDE.md §11.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <PlaceholderHome /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
