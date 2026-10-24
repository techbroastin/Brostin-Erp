import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useSegmentDetail } from '@/features/segments/hooks/useSegments'
import {
  SegmentBuilderDesktopOnlyNotice,
  SegmentErrorState,
  SegmentNotFound,
} from '@/features/segments/components/shared/SegmentParts'
import { DesktopSegmentBuilderContent } from '@/features/segments/components/desktop/DesktopSegmentBuilderContent'

/** Segment Builder route element — /customers/segments/new. Desktop Admin only. */
export function CreateSegmentScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopSegmentBuilderContent /> : <SegmentBuilderDesktopOnlyNotice />
}

/**
 * /customers/segments/:segmentId/edit. Desktop Admin only, custom
 * segments only — pre-built segments are system-maintained.
 */
export function EditSegmentScreen() {
  const { segmentId } = useParams<{ segmentId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: detail, isPending, isError, refetch } = useSegmentDetail(segmentId ?? '')

  if (!isDesktop) return <SegmentBuilderDesktopOnlyNotice />
  if (isError) return <SegmentErrorState message="Couldn't load this segment" onRetry={() => refetch()} />
  if (isPending) return <Skeleton className="h-64 w-full" />
  if (!detail) return <SegmentNotFound />

  if (detail.segment.kind === 'prebuilt') {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Pre-built segments can't be edited.</p>
        <p className="text-body-sm text-muted-foreground">
          They are maintained automatically. Create a custom segment instead.
        </p>
      </div>
    )
  }

  return <DesktopSegmentBuilderContent key={detail.segment.id} segment={detail.segment} />
}
