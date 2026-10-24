import { useQuery } from '@tanstack/react-query'
import { getFeedbackSummary } from '@/features/feedback/services/feedbackService'

/** Under ['feedback'], so a new rating (useSubmitFeedbackRating) refreshes it too. */
export function useFeedbackSummary() {
  return useQuery({
    queryKey: ['feedback', 'summary'],
    queryFn: () => getFeedbackSummary(),
  })
}
