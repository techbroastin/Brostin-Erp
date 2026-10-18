import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useFeedbackDetail } from '@/features/feedback/hooks/useFeedbackDetail'
import { FeedbackErrorState } from '@/features/feedback/components/shared/FeedbackErrorState'
import { MobileFeedbackDetailContent } from '@/features/feedback/components/mobile/MobileFeedbackDetailContent'
import { DesktopFeedbackDetailContent } from '@/features/feedback/components/desktop/DesktopFeedbackDetailContent'

export function FeedbackDetailScreen() {
  const { feedbackId } = useParams<{ feedbackId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: feedback, isPending, isError, refetch } = useFeedbackDetail(feedbackId ?? '')

  if (isError) {
    return (
      <div className={isDesktop ? '' : 'p-4'}>
        <FeedbackErrorState message="Couldn't load feedback." onRetry={() => refetch()} />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className={isDesktop ? 'flex flex-col gap-4' : 'flex flex-col gap-4 p-4'}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!feedback) {
    return (
      <div
        className={
          isDesktop
            ? 'flex flex-col items-center gap-2 py-16 text-center'
            : 'flex flex-col items-center gap-2 p-4 py-16 text-center'
        }
      >
        <p className="text-body font-medium">Feedback not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This feedback doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return isDesktop ? (
    <DesktopFeedbackDetailContent feedback={feedback} />
  ) : (
    <MobileFeedbackDetailContent feedback={feedback} />
  )
}
