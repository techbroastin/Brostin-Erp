import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { useWorkflowRuns } from '@/features/automation/hooks/useWorkflowEngine'
import { WorkflowRunSteps } from '@/features/automation/components/desktop/WorkflowRunSteps'

/**
 * Book 3 §3 Workflow Run Log — every run (test or live) with its path.
 * For one workflow, or every workflow (Automation Overview) when
 * `workflowId` is omitted. Append-only; runs can't be edited or removed.
 */
export function WorkflowRunLog({ workflowId, limit }: { workflowId?: string; limit?: number }) {
  const { data, isPending, isError } = useWorkflowRuns(workflowId)
  const runs = limit ? (data ?? []).slice(0, limit) : (data ?? [])

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>{workflowId ? 'Run log' : 'Recent runs'}</CardSectionHeading>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isError ? (
          <p className="text-body-sm text-destructive">Couldn't load the run log.</p>
        ) : isPending ? (
          <p className="text-body-sm text-muted-foreground">Loading runs…</p>
        ) : runs.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">
            No runs yet. Live runs start once real order and customer events arrive from the POS/QR feed (a later
            phase); test runs appear here as soon as you run one.
          </p>
        ) : (
          runs.map((run) => (
            <details key={run.id} className="rounded-lg border border-border px-3 py-2">
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-body-sm">
                <span className="text-muted-foreground">
                  {new Date(run.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <Badge variant={run.mode === 'test' ? 'outline' : 'secondary'}>{run.mode === 'test' ? 'Test' : 'Live'}</Badge>
                {!workflowId && (
                  <Link to={`/automation/${run.workflowId}`} className="font-medium hover:underline">
                    {run.workflowName}
                  </Link>
                )}
                <span>{run.customerName}</span>
                <span className={run.completed ? 'text-success' : 'text-muted-foreground'}>
                  {run.completed ? '· actions ran' : '· stopped at a condition'}
                </span>
              </summary>
              <div className="mt-2 border-t border-border pt-2">
                <WorkflowRunSteps run={run} />
              </div>
            </details>
          ))
        )}
      </CardContent>
    </Card>
  )
}
