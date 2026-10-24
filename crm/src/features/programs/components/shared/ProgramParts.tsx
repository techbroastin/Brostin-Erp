import type { ReactNode } from 'react'
import { Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import { COST_OWNER_LABELS, STATUS_LABELS, type ProgramStatus, type ProgramSummary } from '@/features/programs/types/program'
import { describeReward, describeTrigger } from '@/features/programs/utils/programRules'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<ProgramStatus, string> = {
  active: 'text-success',
  paused: 'text-warning',
  draft: 'text-muted-foreground',
  archived: 'text-muted-foreground line-through',
}

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

/** The program's rule in plain words — shared by the phone and desktop detail pages. */
export function ProgramRuleSummary({ program, allPrograms }: { program: ProgramSummary; allPrograms: ProgramSummary[] }) {
  const exclusive = allPrograms.filter((p) => program.exclusiveWith.includes(p.id)).map((p) => p.name)
  return (
    <dl className="flex flex-col gap-2.5 text-body-sm">
      <Row label="Who">{program.segmentId === null ? 'All customers' : (program.segmentName ?? 'Segment deleted')}</Row>
      <Row label="When">{describeTrigger(program)}</Row>
      <Row label="Reward">{program.rewardName ?? describeReward(program.reward)}</Row>
      <Row label="Told by">
        {MESSAGE_CHANNEL_LABELS[program.message.channel]}
        {' · fallback: '}
        {program.message.fallback === null
          ? 'not set'
          : program.message.fallback === 'log_only'
            ? 'log only'
            : MESSAGE_CHANNEL_LABELS[program.message.fallback]}
      </Row>
      <Row label="Paid by">{program.costOwner ? COST_OWNER_LABELS[program.costOwner] : <span className="text-destructive">Not set</span>}</Row>
      <Row label="Can't combine with">{exclusive.length > 0 ? exclusive.join(', ') : 'None'}</Row>
    </dl>
  )
}

export function ProgramDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          Programs are built and published from Desktop Admin. You can view them on your phone.
        </p>
      </div>
    </div>
  )
}
