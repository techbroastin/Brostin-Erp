import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Gift,
  Megaphone,
  Workflow,
  MessageSquare,
  Share2,
  IdCard,
  QrCode,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

/**
 * The single, central navigation data definition — docs/NAVIGATION.md §4:
 * "The frontend implements navigation from a single central navigation
 * definition so mobile and desktop stay consistent... Adding or reordering
 * a menu item must require a change in one place."
 *
 * Reproduced exactly from docs/NAVIGATION.md §5–§20. Labels, paths and
 * submenu items are not invented, simplified or reworded. `mobileVisible`
 * encodes §19 (Campaigns and Automation are DESKTOP ADMIN ONLY). Icons are
 * not specified by NAVIGATION.md (§1: "does NOT define... final UI
 * design") — chosen here as a reasonable Lucide mapping.
 */

export type NavSubmenuItem = {
  label: string
  path: string
}

export type NavModule = {
  id: string
  label: string
  icon: LucideIcon
  path: string
  /** false only for Campaigns and Automation, per NAVIGATION.md §19. */
  mobileVisible: boolean
  submenu?: NavSubmenuItem[]
}

export const navigationModules: NavModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    mobileVisible: true,
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/customers',
    mobileVisible: true,
    submenu: [
      { label: 'All Customers', path: '/customers' },
      { label: 'Segments', path: '/customers/segments' },
      { label: 'VIP Customers', path: '/customers/vip' },
      { label: 'At Risk', path: '/customers/at-risk' },
      { label: 'Customer Activity', path: '/customers/activity' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ClipboardList,
    path: '/orders',
    mobileVisible: true,
    submenu: [
      { label: 'All Orders', path: '/orders' },
      { label: 'Today', path: '/orders/today' },
    ],
  },
  {
    id: 'loyalty',
    label: 'Loyalty',
    icon: Gift,
    path: '/loyalty',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/loyalty' },
      { label: 'Customer Balances', path: '/loyalty/customers' },
      { label: 'Rewards', path: '/loyalty/rewards' },
      { label: 'Activity', path: '/loyalty/activity' },
    ],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    path: '/campaigns',
    // DESKTOP ADMIN ONLY — docs/NAVIGATION.md §11/§19.
    mobileVisible: false,
    submenu: [
      { label: 'Overview', path: '/campaigns' },
      { label: 'All Campaigns', path: '/campaigns/all' },
      { label: 'Create Campaign', path: '/campaigns/new' },
      { label: 'Coupons', path: '/campaigns/coupons' },
      { label: 'Message Log', path: '/campaigns/messages' },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Workflow,
    path: '/automation',
    // DESKTOP ADMIN ONLY — docs/NAVIGATION.md §12/§19.
    mobileVisible: false,
    submenu: [
      { label: 'Overview', path: '/automation' },
      { label: 'Workflows', path: '/automation/workflows' },
      { label: 'Create Workflow', path: '/automation/new' },
    ],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    path: '/feedback',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/feedback' },
      { label: 'All Feedback', path: '/feedback/all' },
      { label: 'Negative Feedback', path: '/feedback/negative' },
    ],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    icon: Share2,
    path: '/referrals',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/referrals' },
      { label: 'Customers', path: '/referrals/customers' },
      { label: 'Activity', path: '/referrals/activity' },
      { label: 'Rewards', path: '/referrals/rewards' },
    ],
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: IdCard,
    path: '/membership',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/membership' },
      { label: 'Members', path: '/membership/members' },
      { label: 'Plans', path: '/membership/plans' },
      { label: 'Activity', path: '/membership/activity' },
    ],
  },
  {
    id: 'qr',
    label: 'QR',
    icon: QrCode,
    path: '/qr',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/qr' },
      { label: 'QR Orders', path: '/qr/orders' },
      { label: 'QR Settings', path: '/qr/settings' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    mobileVisible: true,
    submenu: [
      { label: 'Overview', path: '/analytics' },
      { label: 'Sales', path: '/analytics/sales' },
      { label: 'Customers', path: '/analytics/customers' },
      { label: 'Loyalty', path: '/analytics/loyalty' },
      { label: 'Marketing', path: '/analytics/marketing' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    // §19 marks mobile visibility "LIMITED" (not hidden): the module
    // still appears, but MOBILE_UI_SPEC.md §22 describes a simplified
    // mobile Settings screen (Account, Notifications, Preferences, App,
    // Logout) rather than this full desktop submenu. That simplification
    // belongs to the future mobile Settings screen implementation, not to
    // this shared navigation data — the submenu below is reproduced
    // exactly from NAVIGATION.md §18 and is not trimmed here.
    mobileVisible: true,
    submenu: [
      { label: 'General', path: '/settings/general' },
      { label: 'Users', path: '/settings/users' },
      { label: 'Roles & Access', path: '/settings/roles' },
      { label: 'Notifications', path: '/settings/notifications' },
      { label: 'Integrations', path: '/settings/integrations' },
      { label: 'System', path: '/settings/system' },
    ],
  },
]
