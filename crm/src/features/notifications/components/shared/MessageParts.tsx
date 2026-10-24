import { AlertTriangle, ArrowRight, Ban, CheckCheck, Check, FileText, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import type { AttemptOutcome, DeliveryAttempt, MessageStatus } from '@/features/notifications/types/message'
import { MESSAGE_STATUS_LABELS } from '@/features/notifications/utils/messageFormat'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<MessageStatus, { icon: typeof Check; className: string }> = {
  read: { icon: CheckCheck, className: 'text-success' },
  delivered: { icon: CheckCheck, className: 'text-success' },
  sent: { icon: Check, className: 'text-info' },
  log_only: { icon: FileText, className: 'text-muted-foreground' },
  blocked_weekly_limit: { icon: Ban, className: 'text-warning' },
}

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const { icon: Icon, className } = STATUS_STYLE[status]
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {MESSAGE_STATUS_LABELS[status]}
    </Badge>
  )
}

const OUTCOME_TEXT: Record<AttemptOutcome, string> = {
  skipped_opted_out: 'opted out',
  skipped_no_address: 'no address',
  failed: 'failed',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
}

/** The channels tried, in order, e.g. "WhatsApp (opted out) → SMS (delivered)". */
export function AttemptPath({ attempts }: { attempts: DeliveryAttempt[] }) {
  if (attempts.length === 0) return <span className="text-muted-foreground">Not tried</span>
  return (
    <span className="flex flex-wrap items-center gap-1 text-body-sm">
      {attempts.map((attempt, i) => {
        const ok = attempt.outcome === 'sent' || attempt.outcome === 'delivered' || attempt.outcome === 'read'
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
            <span className={cn(ok ? 'font-medium' : 'text-muted-foreground')}>
              {MESSAGE_CHANNEL_LABELS[attempt.channel]}
              <span className={cn('ml-1 text-caption', !ok && 'line-through decoration-muted-foreground/50')}>
                ({OUTCOME_TEXT[attempt.outcome]})
              </span>
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function MessageErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <h2 className="text-section-title font-semibold">Couldn't load messages</h2>
        <p className="mt-1 text-body text-muted-foreground">Something went wrong. Please try again.</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}

/** The Message Log lives under Campaigns, which is Desktop Admin only (docs/NAVIGATION.md §11/§19). */
export function MessageLogDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          The Message Log is part of Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}
