import { useParams } from 'react-router-dom'
import { PublicFeedbackCaptureContent } from '@/features/feedback/components/public/PublicFeedbackCaptureContent'

/** Public route element — /review/:orderId. No CRM shell. Not in any nav menu. */
export function PublicFeedbackCaptureScreen() {
  const { orderId } = useParams<{ orderId: string }>()

  if (!orderId) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-2 p-4 text-center">
        <h1 className="text-page-title font-semibold">This link isn't valid</h1>
        <p className="text-body-sm text-muted-foreground">No order reference was found in this link.</p>
      </div>
    )
  }

  return <PublicFeedbackCaptureContent orderId={orderId} />
}
