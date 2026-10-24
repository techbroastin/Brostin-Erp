import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileSegmentListContent } from '@/features/segments/components/mobile/MobileSegmentListContent'
import { DesktopSegmentListContent } from '@/features/segments/components/desktop/DesktopSegmentListContent'

/** Segment List route element — /customers/segments (docs/NAVIGATION.md §8.3). */
export function SegmentsListScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopSegmentListContent /> : <MobileSegmentListContent />
}
