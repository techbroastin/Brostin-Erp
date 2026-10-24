import { Link } from 'react-router-dom'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRupees } from '@/features/customers/utils/customerFormat'
import type { CouponRedemption } from '@/features/coupons/types/coupon'

/**
 * Shared by the Redemption Log and a coupon's detail page. The coupon
 * column is hidden on the detail page, where it would repeat itself.
 */
export function RedemptionTable({
  items,
  isLoading = false,
  showCoupon = true,
}: {
  items: CouponRedemption[]
  isLoading?: boolean
  showCoupon?: boolean
}) {
  const columnCount = showCoupon ? 6 : 5
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Redeemed</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Code</TableHead>
          {showCoupon && <TableHead>Coupon</TableHead>}
          <TableHead>Order</TableHead>
          <TableHead className="text-right">Discount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {new Date(r.redeemedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </TableCell>
                <TableCell>
                  <Link to={`/customers/${r.customerId}`} className="font-medium hover:underline">
                    {r.customerName}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-body-sm">{r.code}</TableCell>
                {showCoupon && (
                  <TableCell>
                    <Link to={`/campaigns/coupons/${r.couponId}`} className="hover:underline">
                      {r.couponName}
                    </Link>
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">{r.orderId}</TableCell>
                <TableCell className="text-right">{formatRupees(r.discountAmount)}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
