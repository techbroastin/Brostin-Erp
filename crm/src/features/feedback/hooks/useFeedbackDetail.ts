import { useQuery } from '@tanstack/react-query'
import { getFeedbackById } from '@/features/feedback/services/feedbackService'

export const feedbackDetailQueryKey = (id: string) => ['feedback', 'detail', id] as const

export function useFeedbackDetail(id: string) {
  return useQuery({
    queryKey: feedbackDetailQueryKey(id),
    queryFn: () => getFeedbackById(id),
  })
}
