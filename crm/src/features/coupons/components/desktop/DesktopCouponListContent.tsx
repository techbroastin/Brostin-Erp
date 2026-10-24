import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TicketPercent } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { CouponErrorState, CouponStatusBadge, CouponTabs } from '@/features/coupons/components/shared/CouponParts'
import { useCoupons } from '@/features/coupons/hooks/useCoupons'
import { CHANNEL_LABELS, COUPON_STATUS_LABELS, formatDiscount } from '@/features/coupons/utils/couponRules'
import { formatCalendarDate } from '@/features/customers/utils/customerFormat'
import type { CouponStatus } from '@/features/coupons/types/coupon'

const COLUMN_COUNT = 8

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** Coupon List — Book 3 §12. Desktop Admin only (lives under Campaigns). */
export function DesktopCouponListContent() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CouponStatus | 'all'>('all')
  const debouncedSearch = useDebouncedValue(search)
  const { data, isPending, isError, refetch } = useCoupons({ search: debouncedSearch, status })
  const items = data ?? []
  const filtered = debouncedSearch !== '' || status !== 'all'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Coupons</h1>
          <DemoDataBadge />
        </div>
        <Link to="/campaigns/coupons/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
          <Plus className="size-4" />
          New coupon
        </Link>
      </div>

      <CouponTabs />

      <div className="flex items-center gap-3">
        <div className="w-72">
          <SearchInput
            id="coupon-search"
            label="Search coupons"
            placeholder="Search by name or code…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <select
          aria-label="Filter by status"
          className={selectClassName}
          value={status}
          onChange={(e) => setStatus(e.target.value as CouponStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {(Object.keys(COUPON_STATUS_LABELS) as CouponStatus[]).map((s) => (
            <option key={s} value={s}>
              {COUPON_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <CouponErrorState message="Couldn't load coupons" onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <TicketPercent className="size-8 text-muted-foreground" />
              <p className="text-body font-medium">
                {filtered ? 'No coupons match these filters.' : 'No coupons yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : items.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium">{coupon.name}</TableCell>
                        <TableCell>
                          {coupon.codeMode === 'shared' ? (
                            <span className="font-mono text-body-sm">{coupon.codes[0]}</span>
                          ) : (
                            <span className="text-muted-foreground">{coupon.codes.length} unique codes</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDiscount(coupon)}</TableCell>
                        <TableCell>{CHANNEL_LABELS[coupon.channel]}</TableCell>
                        <TableCell className="text-right">
                          {coupon.redemptionCount}
                          <span className="text-muted-foreground">
                            {coupon.totalUsageLimit !== null ? ` / ${coupon.totalUsageLimit}` : ''}
                          </span>
                        </TableCell>
                        <TableCell>{formatCalendarDate(coupon.expiresOn)}</TableCell>
                        <TableCell>
                          <CouponStatusBadge status={coupon.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/campaigns/coupons/${coupon.id}`}
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
