import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useCouponDetail } from '@/features/coupons/hooks/useCoupons'
import { CouponDesktopOnlyNotice, CouponErrorState } from '@/features/coupons/components/shared/CouponParts'
import { DesktopCouponListContent } from '@/features/coupons/components/desktop/DesktopCouponListContent'
import { DesktopRedemptionLogContent } from '@/features/coupons/components/desktop/DesktopRedemptionLogContent'
import { DesktopCreateCouponContent } from '@/features/coupons/components/desktop/DesktopCreateCouponContent'
import { DesktopCouponDetailContent } from '@/features/coupons/components/desktop/DesktopCouponDetailContent'

/** /campaigns/coupons — Coupon List. Desktop Admin only. */
export function CouponsScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCouponListContent /> : <CouponDesktopOnlyNotice />
}

/** /campaigns/coupons/redemptions — Redemption Log. Desktop Admin only. */
export function RedemptionLogScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopRedemptionLogContent /> : <CouponDesktopOnlyNotice />
}

/** /campaigns/coupons/new — Coupon Builder. Desktop Admin only. */
export function CreateCouponScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopCreateCouponContent /> : <CouponDesktopOnlyNotice />
}

/** /campaigns/coupons/:couponId — not a menu item. Desktop Admin only. */
export function CouponDetailScreen() {
  const { couponId } = useParams<{ couponId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: detail, isPending, isError, refetch } = useCouponDetail(couponId ?? '')

  if (!isDesktop) return <CouponDesktopOnlyNotice />
  if (isError) return <CouponErrorState message="Couldn't load this coupon" onRetry={() => refetch()} />
  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (!detail) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Coupon not found.</p>
        <p className="text-body-sm text-muted-foreground">This coupon doesn't exist or may have been removed.</p>
      </div>
    )
  }
  return <DesktopCouponDetailContent detail={detail} />
}
