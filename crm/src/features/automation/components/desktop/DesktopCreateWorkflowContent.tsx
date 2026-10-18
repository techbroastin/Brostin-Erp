import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useCreateWorkflow } from '@/features/automation/hooks/useCreateWorkflow'
import { workflowSchema, type WorkflowFormValues } from '@/features/automation/schemas/workflowSchema'
import {
  TRIGGER_LABELS,
  CONDITION_LABELS,
  ACTION_LABELS,
  type TriggerType,
  type ConditionType,
  type ActionType,
} from '@/features/automation/types/automation'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STEPS = ['Trigger', 'Conditions', 'Actions', 'Timing', 'Review'] as const
type Step = 0 | 1 | 2 | 3 | 4

/**
 * Create Workflow — docs/IMPLEMENTATION_PLAN.md §19's potential
 * structure (Trigger → Conditions → Actions → Timing → Status)
 * implemented as a dedicated five-step wizard, per the approved
 * decision: no canvas, no drag-and-drop, no drawers. Validation uses
 * React Hook Form + Zod, same pattern as Create Campaign. Trigger/
 * condition/action options are explicitly illustrative (see
 * types/automation.ts) — selecting any of them never executes
 * anything.
 */
export function DesktopCreateWorkflowContent() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      triggerType: '',
      conditionTypes: [],
      actionTypes: [],
      timing: 'immediate',
      delayMinutes: null,
    },
  })

  const name = useWatch({ control, name: 'name' })
  const triggerType = useWatch({ control, name: 'triggerType' })
  const conditionTypes = useWatch({ control, name: 'conditionTypes' })
  const actionTypes = useWatch({ control, name: 'actionTypes' })
  const timing = useWatch({ control, name: 'timing' })
  const delayMinutes = useWatch({ control, name: 'delayMinutes' })

  const createWorkflow = useCreateWorkflow()

  const toggleCondition = (type: ConditionType) => {
    const current = conditionTypes ?? []
    setValue(
      'conditionTypes',
      current.includes(type) ? current.filter((c) => c !== type) : [...current, type],
      { shouldValidate: true },
    )
  }

  const toggleAction = (type: ActionType) => {
    const current = actionTypes ?? []
    setValue(
      'actionTypes',
      current.includes(type) ? current.filter((a) => a !== type) : [...current, type],
      { shouldValidate: true },
    )
  }

  const STEP_FIELDS: Record<Step, (keyof WorkflowFormValues)[]> = {
    0: ['name', 'triggerType'],
    1: ['conditionTypes'],
    2: ['actionTypes'],
    3: ['timing', 'delayMinutes'],
    4: [],
  }

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid && step < 4) setStep((step + 1) as Step)
  }

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step)
  }

  const onSubmit = handleSubmit((values) => {
    createWorkflow.mutate(
      {
        name: values.name,
        triggerType: values.triggerType as TriggerType,
        conditionTypes: values.conditionTypes as ConditionType[],
        actionTypes: values.actionTypes as ActionType[],
        timing: values.timing,
        delayMinutes: values.timing === 'delayed' ? values.delayMinutes : null,
      },
      {
        onSuccess: (workflow) => navigate(`/automation/${workflow.id}`),
      },
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Create Workflow</h1>
        <DemoDataBadge />
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-caption font-medium',
                i === step
                  ? 'bg-brand-primary text-white'
                  : i < step
                    ? 'bg-brand-primary-soft text-brand-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-body-sm', i === step ? 'font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="workflow-name" className="text-body-sm font-medium">
                  Workflow name
                </label>
                <Input id="workflow-name" {...register('name')} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="workflow-trigger" className="text-body-sm font-medium">
                  Trigger
                </label>
                <select
                  id="workflow-trigger"
                  className={selectClassName}
                  {...register('triggerType')}
                >
                  <option value="">Select a trigger…</option>
                  {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.triggerType && (
                  <p className="text-caption text-destructive">{errors.triggerType.message}</p>
                )}
                <p className="text-caption text-muted-foreground">
                  Illustrative examples only — not finalized Broastin business rules. Selecting a
                  trigger never executes anything.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-caption text-muted-foreground">
                Optional — zero or more. Illustrative examples only; conditions are never actually
                evaluated.
              </p>
              <div className="flex flex-col gap-1">
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm hover:bg-muted">
                    <input
                      type="checkbox"
                      className="accent-brand-primary"
                      checked={(conditionTypes ?? []).includes(value as ConditionType)}
                      onChange={() => toggleCondition(value as ConditionType)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-caption text-muted-foreground">
                Select at least one. Illustrative examples only; actions are never actually
                executed.
              </p>
              {errors.actionTypes && (
                <p className="text-caption text-destructive">{errors.actionTypes.message}</p>
              )}
              <div className="flex flex-col gap-1">
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm hover:bg-muted">
                    <input
                      type="checkbox"
                      className="accent-brand-primary"
                      checked={(actionTypes ?? []).includes(value as ActionType)}
                      onChange={() => toggleAction(value as ActionType)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium">Timing</span>
                <select id="workflow-timing" className={selectClassName} {...register('timing')}>
                  <option value="immediate">Immediate</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>

              {timing === 'delayed' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="workflow-delay" className="text-body-sm font-medium">
                    Delay (minutes)
                  </label>
                  <Input
                    id="workflow-delay"
                    type="number"
                    min={1}
                    aria-invalid={!!errors.delayMinutes}
                    {...register('delayMinutes', { valueAsNumber: true })}
                  />
                  {errors.delayMinutes && (
                    <p className="text-caption text-destructive">{errors.delayMinutes.message}</p>
                  )}
                </div>
              )}

              <p className="text-caption text-muted-foreground">
                Mock configuration only — no scheduler exists, and nothing is actually delayed or run.
              </p>
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger</span>
                <span className="font-medium">
                  {triggerType ? TRIGGER_LABELS[triggerType as TriggerType] : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Conditions</span>
                {(conditionTypes ?? []).length === 0 ? (
                  <span>None</span>
                ) : (
                  (conditionTypes ?? []).map((c) => <span key={c}>{CONDITION_LABELS[c as ConditionType]}</span>)
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Actions</span>
                {(actionTypes ?? []).map((a) => (
                  <span key={a}>{ACTION_LABELS[a as ActionType]}</span>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Timing</span>
                <span className="font-medium">
                  {timing === 'immediate' ? 'Immediate' : `Delayed by ${delayMinutes ?? 0} minutes`}
                </span>
              </div>
              <p className="text-caption text-muted-foreground">
                This workflow will be created as a draft. Activating it later only changes its mock
                status — it never starts monitoring, evaluating, or executing anything.
              </p>
              {createWorkflow.isError && (
                <p className="text-caption text-destructive">
                  Could not create this workflow. Please try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back
          </button>
          {step < 4 ? (
            <button type="button" onClick={goNext} className={buttonVariants({ variant: 'default', size: 'sm' })}>
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={createWorkflow.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {createWorkflow.isPending ? 'Creating…' : 'Create Workflow'}
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
