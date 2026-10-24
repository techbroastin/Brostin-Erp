import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Minus, MoreHorizontal, Package, ShoppingCart, Users, Utensils, Wallet } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { AreaChart } from '@/components/shared/charts/AreaChart'
import { DonutChart } from '@/components/shared/charts/DonutChart'
import { BarChart } from '@/components/shared/charts/BarChart'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { AlertList, AlertListSkeleton } from '@/features/dashboard/components/shared/AlertList'
import { Panel, StatusPill, ViewAll } from '@/features/dashboard/components/desktop/DashboardPanels'
import { useDashboardInsights } from '@/features/dashboard/hooks/useDashboardSummary'
import { ORDER_TYPE_LABELS, minutesAgo, rupees } from '@/features/dashboard/utils/dashboardFormat'
import type { InsightRange, StatCard } from '@/features/dashboard/utils/dashboardInsights'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'
import { cn } from '@/lib/utils'

const RANGES: { id: InsightRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

const STAT_STYLE: Record<StatCard['id'], { icon: typeof Wallet; className: string; href: string }> = {
  sales: { icon: Wallet, className: 'bg-brand-accent text-brand-accent-foreground', href: '/analytics/sales' },
  orders: { icon: ShoppingCart, className: 'bg-brand-accent text-brand-accent-foreground', href: '/orders' },
  customers: { icon: Users, className: 'bg-brand-primary-soft text-brand-primary', href: '/customers' },
  items: { icon: Package, className: 'bg-brand-primary text-white', href: '/orders' },
}

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2 text-caption outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** Live clock for the greeting header; refreshes every 30 seconds. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

function itemCount(lines: { quantity: number }[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0)
}

function greeting(hour: number): string {
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Desktop Dashboard — docs/DESKTOP_UI_SPEC.md §8, laid out after the
 * owner's desktop UI reference (assets/ui-reference/broastin foods
 * dektop ui.png): greeting, four stat cards, sales chart, top items,
 * order-type / payment / customer charts, recent orders, and a right
 * column of live orders, alerts and recent customers. Every figure is
 * worked out from the Orders and Customers demo data. Inventory and
 * low-stock panels from the reference are out of CRM scope; Alerts
 * takes that slot. Structurally independent from MobileDashboardContent.
 */
export function DesktopDashboardContent({
  summary,
  isLoading,
}: {
  summary: DashboardSummary | undefined
  isLoading: boolean
}) {
  const now = useNow()
  const insights = useDashboardInsights()
  const [range, setRange] = useState<InsightRange>('today')
  const [itemsRange, setItemsRange] = useState<InsightRange>('week')
  const data = insights.data

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 font-extrabold tracking-tight">{greeting(now.getHours())}, Arjun!</h1>
          <p className="mt-1 text-body text-muted-foreground">Here's what's happening at Broastin this week.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-body-sm text-muted-foreground">
            {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-h3 font-extrabold">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p>
          <DemoDataBadge />
        </div>
      </div>

      {insights.isError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-body-sm text-destructive">
          Couldn't load dashboard figures.{' '}
          <button type="button" onClick={() => insights.refetch()} className="font-medium underline">
            Retry
          </button>
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 min-[1360px]:grid-cols-4">
            {!data
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : data.stats.map((stat) => {
                  const { icon: Icon, className, href } = STAT_STYLE[stat.id]
                  const change = stat.changePercent
                  const TrendIcon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight
                  return (
                    <Link
                      key={stat.id}
                      to={href}
                      className="flex items-center gap-3.5 rounded-2xl bg-card p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', className)}>
                        <Icon className="size-5.5" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-body-sm whitespace-nowrap text-muted-foreground">{stat.label}</span>
                        <span className="text-h3 font-extrabold">{stat.id === 'sales' ? rupees(stat.value) : stat.value}</span>
                        <span
                          className={cn(
                            'flex flex-wrap items-center gap-x-1 text-caption',
                            change === null || change === 0 ? 'text-muted-foreground' : change > 0 ? 'text-success' : 'text-destructive',
                          )}
                        >
                          <TrendIcon className="size-3.5" />
                          {change === null ? 'New' : `${Math.abs(change)}%`}
                          <span className="w-full text-muted-foreground">vs prev. 7 days</span>
                        </span>
                      </span>
                    </Link>
                  )
                })}
          </div>

          <div className="grid gap-5 min-[1360px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Panel
              title="Sales Overview"
              action={
                <div className="flex rounded-lg bg-canvas p-1" role="group" aria-label="Sales period">
                  {RANGES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={range === r.id}
                      onClick={() => setRange(r.id)}
                      className={cn(
                        'rounded-md px-3 py-1 text-caption font-medium',
                        range === r.id ? 'bg-brand-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              }
            >
              {data ? <AreaChart points={data.sales[range]} formatValue={rupees} width={520} height={250} /> : <Skeleton className="h-52" />}
            </Panel>

            <Panel
              title="Top Selling Items"
              action={
                <select aria-label="Top items period" className={selectClassName} value={itemsRange} onChange={(e) => setItemsRange(e.target.value as InsightRange)}>
                  {RANGES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              }
            >
              {!data ? (
                <Skeleton className="h-52" />
              ) : data.topItems[itemsRange].length === 0 ? (
                <p className="py-8 text-center text-body-sm text-muted-foreground">No items sold in this period.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {data.topItems[itemsRange].map((item, i) => (
                    <li key={item.name} className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas text-caption font-semibold">{i + 1}</span>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent-soft text-[#9a6a00]">
                        <Utensils className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-body-sm font-semibold">{item.name}</span>
                        <span className="block text-caption text-muted-foreground">
                          {item.quantity} sold · {item.orders} order{item.orders === 1 ? '' : 's'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>

          <div className="grid gap-5 min-[1360px]:grid-cols-3">
            <Panel title="Order Type" action={<span className="text-caption text-muted-foreground">This week</span>}>
              {data ? (
                <DonutChart
                  centerValue={String(data.orderTypes.dining + data.orderTypes.takeaway + data.orderTypes.delivery)}
                  centerLabel="Orders"
                  slices={[
                    { label: ORDER_TYPE_LABELS.dining, value: data.orderTypes.dining, color: 'var(--info)' },
                    { label: ORDER_TYPE_LABELS.takeaway, value: data.orderTypes.takeaway, color: 'var(--brand-primary)' },
                    { label: ORDER_TYPE_LABELS.delivery, value: data.orderTypes.delivery, color: 'var(--brand-accent)' },
                  ]}
                />
              ) : (
                <Skeleton className="h-32" />
              )}
            </Panel>
            <Panel title="Payment Method" action={<span className="text-caption text-muted-foreground">This week</span>}>
              {data ? (
                <DonutChart
                  centerValue={rupees(data.payments.upi + data.payments.cash)}
                  centerLabel="Sales"
                  formatValue={rupees}
                  slices={[
                    { label: 'UPI', value: data.payments.upi, color: 'var(--success)' },
                    { label: 'Cash', value: data.payments.cash, color: 'var(--brand-accent)' },
                  ]}
                />
              ) : (
                <Skeleton className="h-32" />
              )}
            </Panel>
            <Panel title="Customer Visits" action={<span className="text-caption text-muted-foreground">Last 7 days</span>}>
              {data ? <BarChart points={data.customerVisits} /> : <Skeleton className="h-32" />}
            </Panel>
          </div>

          <Panel title="Recent Orders" action={<ViewAll to="/orders" label="View All Orders" />}>
            {!data ? (
              <Skeleton className="h-40" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Open</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{minutesAgo(o.createdAt, now.getTime())}</TableCell>
                      <TableCell>{o.customerName}</TableCell>
                      <TableCell>
                        {ORDER_TYPE_LABELS[o.orderType]}
                        {o.source === 'qr' && <span className="ml-1 text-caption text-muted-foreground">· QR</span>}
                      </TableCell>
                      <TableCell>
                        {itemCount(o.items)} item{itemCount(o.items) === 1 ? '' : 's'}
                      </TableCell>
                      <TableCell className="text-right">{rupees(o.grandTotal)}</TableCell>
                      <TableCell>
                        <StatusPill status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/orders/${o.id}`} aria-label={`Open order ${o.orderNumber}`} className="inline-flex rounded-md p-1 text-muted-foreground hover:bg-canvas hover:text-foreground">
                          <MoreHorizontal className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Live Orders" titleClassName="text-brand-primary" action={<ViewAll to="/orders" />} className="bg-brand-primary-soft/40">
            {!data ? (
              <Skeleton className="h-48" />
            ) : data.liveOrders.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No orders in progress.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.liveOrders.map((o) => (
                  <li key={o.id}>
                    <Link
                      to={`/orders/${o.id}`}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-xl border-l-4 bg-card px-3 py-2.5 hover:shadow-sm',
                        o.status === 'ready' ? 'border-info' : o.status === 'preparing' ? 'border-brand-accent' : 'border-brand-primary',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-body-sm font-semibold">
                          {o.orderNumber} <span className="font-normal text-muted-foreground">· {minutesAgo(o.createdAt, now.getTime())}</span>
                        </span>
                        <span className="block truncate text-caption text-muted-foreground">
                          {ORDER_TYPE_LABELS[o.orderType]}
                          {o.source === 'qr' ? ' · QR order' : ''}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-body-sm font-semibold">{rupees(o.grandTotal)}</span>
                        <StatusPill status={o.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Alerts" titleClassName="text-brand-primary" action={<ViewAll to="/feedback/negative" />}>
            {isLoading ? <AlertListSkeleton /> : <AlertList items={summary?.alerts ?? []} />}
          </Panel>

          <Panel title="Recent Customers" titleClassName="text-brand-primary" action={<ViewAll to="/customers" />}>
            {!data ? (
              <Skeleton className="h-48" />
            ) : (
              <ul className="flex flex-col gap-3">
                {data.recentCustomers.map((c) => (
                  <li key={c.id}>
                    <Link to={`/customers/${c.id}`} className="flex items-center gap-3 rounded-lg hover:bg-canvas">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info/15 text-body-sm font-semibold text-info">
                        {c.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-semibold">{c.name}</span>
                        <span className="block text-caption text-muted-foreground">
                          {c.orderCount} orders · Last: {c.lastOrderAt ? minutesAgo(c.lastOrderAt, now.getTime()) : '—'}
                        </span>
                      </span>
                      <span className="shrink-0 text-body-sm font-semibold">{rupees(c.lifetimeSpend)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
