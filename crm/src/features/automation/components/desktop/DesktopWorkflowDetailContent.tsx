import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { WorkflowStatusBadge } from '@/features/automation/components/shared/WorkflowStatusBadge'
import { WorkflowTestPanel } from '@/features/automation/components/desktop/WorkflowTestPanel'
import { WorkflowRunLog } from '@/features/automation/components/desktop/WorkflowRunLog'
import { usePublishProblems } from '@/features/automation/hooks/useWorkflowEngine'
import { updateWorkflowStatus } from '@/features/automation/services/automationService'
import { fallbackLabel } from '@/features/automation/utils/workflowEngine'
import { TRIGGER_LABELS, CONDITION_LABELS, ACTION_LABELS } from '@/features/automation/types/automation'
import type { Workflow } from '@/features/automation/types/automation'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'

/**
 * Workflow page — Book 3 §3: the rule (trigger → conditions → timing →
 * actions), the publish gate (fallback for every message + a test run
 * before a draft goes live), Test/Simulate mode, and the run log.
 * Activating marks the workflow live; live runs begin once the POS/QR
 * event feed is connected (backend phase).
 */
export function DesktopWorkflowDetailContent({ workflow }: { workflow: Workflow }) {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const problems = usePublishProblems(workflow.id)

  const isActive = workflow.status === 'active'
  const canActivate = problems.data?.length === 0

  const updateStatus = useMutation({
    mutationFn: () => updateWorkflowStatus(workflow.id, isActive ? 'paused' : 'active'),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
    onError: (error) =>
      setActionError(error instanceof Error ? error.message : 'Could not update this workflow. Please try again.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{workflow.name}</h1>
          <WorkflowStatusBadge status={workflow.status} />
        </div>
        <div className="flex items-center gap-2">
          {!isActive && (
            <Link to={`/automation/${workflow.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Edit
            </Link>
          )}
          <button
            type="button"
            onClick={() => updateStatus.mutate()}
            disabled={updateStatus.isPending || (!isActive && !canActivate)}
            title={!isActive && !canActivate ? 'Fix the items in "Before it can go live" first' : undefined}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
          >
            {updateStatus.isPending ? 'Updating…' : isActive ? 'Pause' : 'Activate'}
          </button>
        </div>
      </div>

      {actionError && <p className="text-body-sm text-destructive">{actionError}</p>}

      {!isActive && problems.data && (
        <div
          className={
            problems.data.length > 0
              ? 'max-w-2xl rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-body-sm'
              : 'max-w-2xl rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-body-sm'
          }
        >
          {problems.data.length > 0 ? (
            <>
              <p className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="size-4" /> Before it can go live
              </p>
              <ul className="mt-1 list-disc pl-6">
                {problems.data.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" /> Ready to activate.
            </p>
          )}
        </div>
      )}

      <p className="max-w-2xl text-body-sm text-muted-foreground">
        {isActive
          ? 'Active: this workflow will run when its trigger happens. Live events arrive once the POS/QR feed is connected (a later phase), so no live runs happen yet.'
          : 'Edit or test freely while the workflow is not active. Pause an active workflow before changing it.'}
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
              workflow.conditions.map((c, i) => (
                <p key={c.id}>
                  {i > 0 && <span className="mr-1 text-caption text-muted-foreground uppercase">and</span>}
                  {CONDITION_LABELS[c.type]}
                </p>
              ))
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
        <CardContent className="flex flex-col gap-3 text-body-sm">
          {workflow.actions.map((a, i) => (
            <div key={a.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="font-medium">
                {i + 1}. {ACTION_LABELS[a.type]}
                {a.type === 'add_loyalty_points' && `: ${a.points} points`}
              </p>
              {a.type === 'send_message' && (
                <>
                  <p className="whitespace-pre-wrap text-muted-foreground">"{a.message}"</p>
                  <p>
                    By {MESSAGE_CHANNEL_LABELS[a.channel]} · Fallback:{' '}
                    <span className={a.fallback === null ? 'font-medium text-destructive' : ''}>
                      {fallbackLabel(a.fallback)}
                    </span>
                  </p>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <WorkflowTestPanel workflow={workflow} />
      <WorkflowRunLog workflowId={workflow.id} />
    </div>
  )
}
