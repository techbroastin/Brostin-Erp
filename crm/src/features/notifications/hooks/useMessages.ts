import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getMessageSummary, listMessages } from '@/features/notifications/services/notificationService'
import type { MessageListParams } from '@/features/notifications/types/message'

/** Central Message Log query keys, per docs/FRONTEND_ARCHITECTURE.md §17. Invalidate ['messages'] after a send. */
export function useMessages(params: MessageListParams) {
  return useQuery({
    queryKey: ['messages', 'list', params],
    queryFn: () => listMessages(params),
    placeholderData: keepPreviousData,
  })
}

export function useMessageSummary() {
  return useQuery({ queryKey: ['messages', 'summary'], queryFn: () => getMessageSummary() })
}
