import { useQuery } from '@tanstack/react-query'
import { getFeedbackByOrderId } from '@/features/feedback/services/feedbackService'

export const feedbackByOrderIdQueryKey = (orderId: string) => ['feedback', 'by-order', orderId] as const

export function useFeedbackByOrderId(orderId: string) {
  return useQuery({
    queryKey: feedbackByOrderIdQueryKey(orderId),
    queryFn: () => getFeedbackByOrderId(orderId),
    enabled: !!orderId,
  })
}
