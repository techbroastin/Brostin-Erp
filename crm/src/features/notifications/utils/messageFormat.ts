import type { MessageSourceType, MessageStatus } from '@/features/notifications/types/message'

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  read: 'Read',
  delivered: 'Delivered',
  sent: 'Sent',
  log_only: 'Logged only',
  blocked_weekly_limit: 'Weekly limit',
}

export const SOURCE_TYPE_LABELS: Record<MessageSourceType, string> = {
  campaign: 'Campaign',
  program: 'Program',
  workflow: 'Workflow',
}
