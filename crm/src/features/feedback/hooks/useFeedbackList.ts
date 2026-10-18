import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listFeedback } from '@/features/feedback/services/feedbackService'
import type { FeedbackListParams } from '@/features/feedback/types/feedback'

/**
 * The central Feedback list query key, per
 * docs/FRONTEND_ARCHITECTURE.md §17.
 */
export const feedbackListQueryKey = (params: FeedbackListParams) => ['feedback', 'list', params] as const

export function useFeedbackList(params: FeedbackListParams) {
  return useQuery({
    queryKey: feedbackListQueryKey(params),
    queryFn: () => listFeedback(params),
    placeholderData: keepPreviousData,
  })
}
