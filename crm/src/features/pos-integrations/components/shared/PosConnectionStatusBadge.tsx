import { CheckCircle2, AlertTriangle, PauseCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { PosConnectionStatus } from '@/features/pos-integrations/types/posIntegration'
import { cn } from '@/lib/utils'

/**
 * PROVISIONAL status presentation, mirrors WorkflowStatusBadge/
 * OrderStatusBadge exactly. "Connected" here means "the mock adapter's
 * last Test Connection succeeded" — never a real, live vendor
 * connection (no real ManageMe/Petpooja API call exists anywhere).
 */
const STATUS_CONFIG: Record<PosConnectionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  connected: { label: 'Connected', icon: CheckCircle2, className: 'text-success' },
  error: { label: 'Error', icon: AlertTriangle, className: 'text-destructive' },
  disabled: { label: 'Disabled', icon: PauseCircle, className: 'text-muted-foreground' },
  pending: { label: 'Pending', icon: Clock, className: 'text-warning' },
}

export function PosConnectionStatusBadge({ status }: { status: PosConnectionStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status]

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
