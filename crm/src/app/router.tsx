import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundScreen } from '@/layouts/NotFoundScreen'
import { RouteHydrateFallback } from '@/app/RouteHydrateFallback'

/**
 * Router infrastructure — docs/FRONTEND_ARCHITECTURE.md §9: "Route-level
 * screens are code-split (lazy-loaded) per feature." Dashboard, Customers
 * (list/detail), Orders (list/detail), Loyalty (overview/customers/
 * rewards/activity) and Feedback (list ×3 route-driven filter states +
 * detail) all use React Router's `lazy` route property (data router
 * API) so each resolves to its own chunk only when navigated to.
 *
 * All four Loyalty routes are implemented together in Phase 6, unlike
 * Orders/Customers: docs/IMPLEMENTATION_PLAN.md §12 names all of
 * "loyalty overview, customer points/balance, rewards, activity" with no
 * exclusion, mapping 1:1 onto docs/NAVIGATION.md §10's four routes.
 *
 * Feedback (Phase 7) preserves all four docs/NAVIGATION.md §13 routes
 * (/feedback, /feedback/all, /feedback/negative, /feedback/:feedbackId)
 * behind one underlying list implementation — see
 * features/feedback/screens/FeedbackListScreen.tsx. The three fixed
 * sub-paths are declared before the dynamic :feedbackId route so they
 * take precedence, per docs/NAVIGATION.md §38's route-matching note.
 *
 * Referrals (Phase 8) adds all four docs/NAVIGATION.md §14 routes
 * (/referrals, /referrals/customers, /referrals/activity,
 * /referrals/rewards) as four dedicated screens — no dynamic :id
 * sibling exists for this module, so no route-ordering concern applies
 * here the way it does for Feedback.
 *
 * Membership (operational Phase 9 / canonical docs/IMPLEMENTATION_PLAN.md
 * "Phase 12 — Membership") adds all four docs/NAVIGATION.md §15 routes
 * (/membership, /membership/members, /membership/plans,
 * /membership/activity) as four dedicated screens, same shape as
 * Referrals — no dynamic :id sibling, no route-ordering concern.
 *
 * QR Administration (operational Phase 10 / canonical
 * docs/IMPLEMENTATION_PLAN.md "Phase 13 — QR Administration") adds the
 * three docs/NAVIGATION.md §16 routes (/qr, /qr/orders, /qr/settings).
 * Unlike every other module so far, this one is an operational view
 * of the existing Orders feature, not a new entity: QrOrdersScreen
 * reuses Orders' hook/table/card/search/empty/error components
 * unmodified, pinning `source: 'qr'` — nothing inside
 * features/orders/ is changed. The existing QR Ordering Flutter app
 * and its token/table resolution RPC are untouched and unrelated to
 * this React route group.
 *
 * Analytics (operational Phase 11 / canonical
 * docs/IMPLEMENTATION_PLAN.md "Phase 14 — Analytics") adds the five
 * docs/NAVIGATION.md §17 routes (/analytics, /analytics/sales,
 * /analytics/customers, /analytics/loyalty, /analytics/marketing).
 * Like QR Administration, this is a pure aggregation layer over
 * existing Orders/Customers/Loyalty data — analyticsService.ts calls
 * orderService/customerService/loyaltyService directly and introduces
 * no new mock dataset. Charts reuse DesktopDashboardContent.tsx's
 * existing "charting library not yet selected" placeholder; Marketing
 * is a static "not yet available" placeholder (no campaign data model
 * exists). No new routes change anything inside features/orders/,
 * features/customers/ or features/loyalty/.
 *
 * Campaigns (operational Phase 12 / canonical
 * docs/IMPLEMENTATION_PLAN.md "Phase 15 — Campaigns") adds the four
 * docs/NAVIGATION.md §11 routes (/campaigns, /campaigns/all,
 * /campaigns/new, /campaigns/:campaignId). Campaigns are DESKTOP ADMIN
 * ONLY (docs/NAVIGATION.md §19) — navigation.ts already had the
 * correct `mobileVisible: false` entry and is unchanged by this phase.
 * The dynamic :campaignId route is declared after the fixed
 * /campaigns/all and /campaigns/new paths, same ordering rule as
 * Feedback above. campaignService.ts is the first service in this
 * codebase with write/mutation functions (createCampaign,
 * updateCampaignStatus) backed by an in-memory mock store — session-
 * only, never a real send/dispatch.
 *
 * Other per-module routes not yet built (/automation, ...) arrive
 * module-by-module in their own future phases, one hamburger/sidebar
 * section at a time, per docs/NAVIGATION.md §33 and docs/CLAUDE.md §11.
 * /orders/today is explicitly excluded from Phase 5 — not named as a
 * Phase 8 deliverable in docs/IMPLEMENTATION_PLAN.md.
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
      {
        path: 'feedback',
        lazy: async () => {
          const { FeedbackListScreen } = await import('@/features/feedback')
          return { Component: FeedbackListScreen }
        },
      },
      {
        path: 'feedback/all',
        lazy: async () => {
          const { FeedbackListScreen } = await import('@/features/feedback')
          return { Component: FeedbackListScreen }
        },
      },
      {
        path: 'feedback/negative',
        lazy: async () => {
          const { FeedbackListScreen } = await import('@/features/feedback')
          return { Component: FeedbackListScreen }
        },
      },
      {
        path: 'feedback/:feedbackId',
        lazy: async () => {
          const { FeedbackDetailScreen } = await import('@/features/feedback')
          return { Component: FeedbackDetailScreen }
        },
      },
      {
        path: 'referrals',
        lazy: async () => {
          const { ReferralOverviewScreen } = await import('@/features/referrals')
          return { Component: ReferralOverviewScreen }
        },
      },
      {
        path: 'referrals/customers',
        lazy: async () => {
          const { ReferralCustomersScreen } = await import('@/features/referrals')
          return { Component: ReferralCustomersScreen }
        },
      },
      {
        path: 'referrals/activity',
        lazy: async () => {
          const { ReferralActivityScreen } = await import('@/features/referrals')
          return { Component: ReferralActivityScreen }
        },
      },
      {
        path: 'referrals/rewards',
        lazy: async () => {
          const { ReferralRewardsScreen } = await import('@/features/referrals')
          return { Component: ReferralRewardsScreen }
        },
      },
      {
        path: 'membership',
        lazy: async () => {
          const { MembershipOverviewScreen } = await import('@/features/membership')
          return { Component: MembershipOverviewScreen }
        },
      },
      {
        path: 'membership/members',
        lazy: async () => {
          const { MembersScreen } = await import('@/features/membership')
          return { Component: MembersScreen }
        },
      },
      {
        path: 'membership/plans',
        lazy: async () => {
          const { MembershipPlansScreen } = await import('@/features/membership')
          return { Component: MembershipPlansScreen }
        },
      },
      {
        path: 'membership/activity',
        lazy: async () => {
          const { MembershipActivityScreen } = await import('@/features/membership')
          return { Component: MembershipActivityScreen }
        },
      },
      {
        path: 'qr',
        lazy: async () => {
          const { QrOverviewScreen } = await import('@/features/qr')
          return { Component: QrOverviewScreen }
        },
      },
      {
        path: 'qr/orders',
        lazy: async () => {
          const { QrOrdersScreen } = await import('@/features/qr')
          return { Component: QrOrdersScreen }
        },
      },
      {
        path: 'qr/settings',
        lazy: async () => {
          const { QrSettingsScreen } = await import('@/features/qr')
          return { Component: QrSettingsScreen }
        },
      },
      {
        path: 'analytics',
        lazy: async () => {
          const { AnalyticsOverviewScreen } = await import('@/features/analytics')
          return { Component: AnalyticsOverviewScreen }
        },
      },
      {
        path: 'analytics/sales',
        lazy: async () => {
          const { SalesAnalyticsScreen } = await import('@/features/analytics')
          return { Component: SalesAnalyticsScreen }
        },
      },
      {
        path: 'analytics/customers',
        lazy: async () => {
          const { CustomerAnalyticsScreen } = await import('@/features/analytics')
          return { Component: CustomerAnalyticsScreen }
        },
      },
      {
        path: 'analytics/loyalty',
        lazy: async () => {
          const { LoyaltyAnalyticsScreen } = await import('@/features/analytics')
          return { Component: LoyaltyAnalyticsScreen }
        },
      },
      {
        path: 'analytics/marketing',
        lazy: async () => {
          const { MarketingAnalyticsScreen } = await import('@/features/analytics')
          return { Component: MarketingAnalyticsScreen }
        },
      },
      {
        path: 'campaigns',
        lazy: async () => {
          const { CampaignOverviewScreen } = await import('@/features/campaigns')
          return { Component: CampaignOverviewScreen }
        },
      },
      {
        path: 'campaigns/all',
        lazy: async () => {
          const { AllCampaignsScreen } = await import('@/features/campaigns')
          return { Component: AllCampaignsScreen }
        },
      },
      {
        path: 'campaigns/new',
        lazy: async () => {
          const { CreateCampaignScreen } = await import('@/features/campaigns')
          return { Component: CreateCampaignScreen }
        },
      },
      {
        path: 'campaigns/:campaignId',
        lazy: async () => {
          const { CampaignDetailScreen } = await import('@/features/campaigns')
          return { Component: CampaignDetailScreen }
        },
      },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
])
