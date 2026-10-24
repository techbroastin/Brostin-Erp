import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useSegmentDetail } from '@/features/segments/hooks/useSegments'
import { SegmentErrorState, SegmentNotFound } from '@/features/segments/components/shared/SegmentParts'
import { MobileSegmentDetailContent } from '@/features/segments/components/mobile/MobileSegmentDetailContent'
import { DesktopSegmentDetailContent } from '@/features/segments/components/desktop/DesktopSegmentDetailContent'

/**
 * Segment Membership route element — /customers/segments/:segmentId. Not
 * a menu item. With `segmentId` given it shows that fixed segment: the
 * Customers menu's "VIP Customers" and "At Risk" entries are the
 * pre-built Loyal / VIP and At risk segments (docs/NAVIGATION.md §8.4/§8.5
 * leave the exact rules unfinalized; Book 3 §10 defines these segments).
 */
export function SegmentDetailScreen({ segmentId: fixedId }: { segmentId?: string } = {}) {
  const params = useParams<{ segmentId: string }>()
  const segmentId = fixedId ?? params.segmentId
  const isDesktop = useIsDesktopViewport()
  const { data: detail, isPending, isError, refetch } = useSegmentDetail(segmentId ?? '')

  if (isError) {
    return <SegmentErrorState message="Couldn't load this segment" onRetry={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-4 lg:p-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!detail) return <SegmentNotFound />

  return isDesktop ? <DesktopSegmentDetailContent detail={detail} /> : <MobileSegmentDetailContent detail={detail} />
}

/** /customers/vip — Customers menu "VIP Customers". */
export function VipCustomersScreen() {
  return <SegmentDetailScreen segmentId="seg-vip" />
}

/** /customers/at-risk — Customers menu "At Risk". */
export function AtRiskCustomersScreen() {
  return <SegmentDetailScreen segmentId="seg-at-risk" />
}
