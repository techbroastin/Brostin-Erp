import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import type { RunStepOutcome, WorkflowRun } from '@/features/automation/types/automation'
import { cn } from '@/lib/utils'

const OUTCOME_ICON: Record<RunStepOutcome, { icon: typeof Circle; className: string; label: string }> = {
  passed: { icon: CheckCircle2, className: 'text-success', label: 'Passed' },
  done: { icon: CheckCircle2, className: 'text-success', label: 'Done' },
  failed: { icon: XCircle, className: 'text-destructive', label: 'Failed' },
  would_do: { icon: Clock, className: 'text-info', label: 'Would run' },
}

/** The path a run took, step by step (Book 3 §3: "which path taken, what fired"). */
export function WorkflowRunSteps({ run }: { run: Pick<WorkflowRun, 'steps' | 'completed'> }) {
  return (
    <ol className="flex flex-col gap-2">
      {run.steps.map((step, i) => {
        const { icon: Icon, className, label } = OUTCOME_ICON[step.outcome]
        return (
          <li key={i} className="flex gap-2 text-body-sm">
            <Icon className={cn('mt-0.5 size-4 shrink-0', className)} aria-label={label} />
            <div className="min-w-0">
              <p className="font-medium">
                <span className="mr-1.5 text-caption font-normal text-muted-foreground uppercase">{step.kind}</span>
                {step.label}
              </p>
              <p className="text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        )
      })}
      {!run.completed && (
        <li className="pl-6 text-caption text-muted-foreground">Stopped here — no actions ran.</li>
      )}
    </ol>
  )
}
