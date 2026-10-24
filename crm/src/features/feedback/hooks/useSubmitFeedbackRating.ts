import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitFeedbackRating } from '@/features/feedback/services/feedbackService'

/** Invalidates the Feedback Inbox and this order's feedback-lookup query on success. */
export function useSubmitFeedbackRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitFeedbackRating,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['customers', 'timeline', created.customerId] })
    },
  })
}
