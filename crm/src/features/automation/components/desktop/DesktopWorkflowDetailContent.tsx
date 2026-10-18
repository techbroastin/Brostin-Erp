import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { WorkflowStatusBadge } from '@/features/automation/components/shared/WorkflowStatusBadge'
import { updateWorkflowStatus } from '@/features/automation/services/automationService'
import { TRIGGER_LABELS, CONDITION_LABELS, ACTION_LABELS } from '@/features/automation/types/automation'
import type { Workflow } from '@/features/automation/types/automation'

/**
 * docs/DESKTOP_UI_SPEC.md — denser multi-column layout. "Activate"/
 * "Pause" only ever transition the mock status — they never start
 * monitoring, evaluating, or executing anything (no automation engine
 * exists or is implied, per docs/IMPLEMENTATION_PLAN.md §19).
 */
export function DesktopWorkflowDetailContent({ workflow }: { workflow: Workflow }) {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const nextStatus = workflow.status === 'active' ? 'paused' : 'active'
  const actionLabel = workflow.status === 'active' ? 'Pause' : 'Activate'

  const updateStatus = useMutation({
    mutationFn: () => updateWorkflowStatus(workflow.id, nextStatus),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
    onError: () => setActionError('Could not update this workflow. Please try again.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{workflow.name}</h1>
          <WorkflowStatusBadge status={workflow.status} />
        </div>
        <button
          type="button"
          onClick={() => updateStatus.mutate()}
          disabled={updateStatus.isPending}
          className={buttonVariants({ variant: 'default', size: 'sm' })}
        >
          {updateStatus.isPending ? 'Updating…' : actionLabel}
        </button>
      </div>

      {actionError && <p className="text-body-sm text-destructive">{actionError}</p>}

      <p className="max-w-md text-body-sm text-muted-foreground">
        Activating or pausing this workflow only updates its mock status in this demo — it never
        starts monitoring triggers, evaluating conditions, or executing actions. No automation
        engine, scheduler, or notification delivery exists yet.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardSectionHeading>Trigger</CardSectionHeading>
          </CardHeader>
          <CardContent className="text-body-sm">{TRIGGER_LABELS[workflow.triggerType]}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Conditions</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-body-sm">
            {workflow.conditions.length === 0 ? (
              <p className="text-muted-foreground">No conditions — runs on every trigger match.</p>
            ) : (
              workflow.conditions.map((c) => <p key={c.id}>{CONDITION_LABELS[c.type]}</p>)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Timing</CardSectionHeading>
          </CardHeader>
          <CardContent className="text-body-sm">
            {workflow.timing === 'immediate' ? 'Immediate' : `Delayed by ${workflow.delayMinutes} minutes`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>Actions</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-body-sm">
          {workflow.actions.map((a) => (
            <p key={a.id}>{ACTION_LABELS[a.type]}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
