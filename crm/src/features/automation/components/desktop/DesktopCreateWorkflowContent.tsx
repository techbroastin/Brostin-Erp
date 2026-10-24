import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useCreateWorkflow } from '@/features/automation/hooks/useCreateWorkflow'
import { useUpdateWorkflow } from '@/features/automation/hooks/useWorkflowEngine'
import {
  EMPTY_WORKFLOW_FORM,
  toWorkflowForm,
  toWorkflowInput,
  workflowSchema,
  type WorkflowFormValues,
} from '@/features/automation/schemas/workflowSchema'
import {
  TRIGGER_LABELS,
  CONDITION_LABELS,
  ACTION_LABELS,
  type TriggerType,
  type ConditionType,
  type Workflow,
} from '@/features/automation/types/automation'
import { fallbackLabel } from '@/features/automation/utils/workflowEngine'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import { TokenHint } from '@/features/campaigns/components/shared/MessagePreview'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const textareaClassName =
  'min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm'

const STEPS = ['Trigger', 'Conditions', 'Actions', 'Timing', 'Review'] as const
type Step = 0 | 1 | 2 | 3 | 4

const STEP_FIELDS: Record<Step, (keyof WorkflowFormValues)[]> = {
  0: ['name', 'triggerType'],
  1: ['conditionTypes'],
  2: ['sendMessage', 'addPoints', 'flag'],
  3: ['timing', 'delayMinutes'],
  4: [],
}

/**
 * Create / Edit Workflow — Book 3 §3 MVP: simple linear rules in a
 * five-step wizard (no canvas — that's Phase 2). Each action carries
 * its settings; a message's fallback may be left unset in a draft, but
 * the workflow can't go live until it's chosen (publish gate on the
 * workflow page).
 */
export function DesktopCreateWorkflowContent({ workflow }: { workflow?: Workflow }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const isEdit = workflow !== undefined

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: workflow ? toWorkflowForm(workflow) : EMPTY_WORKFLOW_FORM,
  })

  const values = useWatch({ control }) as WorkflowFormValues
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow(workflow?.id ?? '')
  const save = isEdit ? updateWorkflow : createWorkflow

  const toggleCondition = (type: ConditionType) => {
    const current = values.conditionTypes ?? []
    setValue('conditionTypes', current.includes(type) ? current.filter((c) => c !== type) : [...current, type], {
      shouldValidate: true,
    })
  }

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid && step < 4) setStep((step + 1) as Step)
  }

  const onSubmit = handleSubmit((v) => {
    save.mutate(toWorkflowInput(v), { onSuccess: (saved) => navigate(`/automation/${saved.id}`) })
  })

  const actionSummary = [
    values.sendMessage?.enabled &&
      `${ACTION_LABELS.send_message} by ${MESSAGE_CHANNEL_LABELS[values.sendMessage.channel]} (fallback: ${fallbackLabel(
        values.sendMessage.fallback === '' ? null : values.sendMessage.fallback,
      )})`,
    values.addPoints?.enabled && `${ACTION_LABELS.add_loyalty_points}: ${values.addPoints.points}`,
    values.flag?.enabled && ACTION_LABELS.flag_for_review,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">{isEdit ? 'Edit Workflow' : 'Create Workflow'}</h1>
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
            <span className={cn('text-body-sm', i === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
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
                <select id="workflow-trigger" className={selectClassName} {...register('triggerType')}>
                  <option value="">Select a trigger…</option>
                  {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.triggerType && <p className="text-caption text-destructive">{errors.triggerType.message}</p>}
                <p className="text-caption text-muted-foreground">
                  Live runs start when these events arrive from the POS/QR feed (connected in a later phase). Until
                  then you can test the workflow on a customer.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-caption text-muted-foreground">
                Optional. Every ticked condition must pass, in order; the first that fails stops the run.
              </p>
              <div className="flex flex-col gap-1">
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm hover:bg-muted">
                    <input
                      type="checkbox"
                      className="accent-brand-primary"
                      checked={(values.conditionTypes ?? []).includes(value)}
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
              <p className="text-caption text-muted-foreground">Select at least one. Actions run in this order.</p>
              {errors.flag?.enabled && <p className="text-caption text-destructive">{errors.flag.enabled.message}</p>}

              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <label className="flex items-center gap-2.5 text-body-sm font-medium">
                  <input type="checkbox" className="accent-brand-primary" {...register('sendMessage.enabled')} />
                  {ACTION_LABELS.send_message}
                </label>
                {values.sendMessage?.enabled && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="workflow-message" className="text-body-sm">
                        Message
                      </label>
                      <textarea
                        id="workflow-message"
                        className={textareaClassName}
                        aria-invalid={!!errors.sendMessage?.message}
                        {...register('sendMessage.message')}
                      />
                      {errors.sendMessage?.message && (
                        <p className="text-caption text-destructive">{errors.sendMessage.message.message}</p>
                      )}
                      <TokenHint />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="workflow-channel" className="text-body-sm">
                          Send by
                        </label>
                        <select id="workflow-channel" className={selectClassName} {...register('sendMessage.channel')}>
                          {Object.entries(MESSAGE_CHANNEL_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="workflow-fallback" className="text-body-sm">
                          If that fails or they opted out
                        </label>
                        <select id="workflow-fallback" className={selectClassName} {...register('sendMessage.fallback')}>
                          <option value="">Choose a fallback…</option>
                          {Object.entries(MESSAGE_CHANNEL_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              Try {label}
                            </option>
                          ))}
                          <option value="log_only">Log only (don't send)</option>
                        </select>
                        {errors.sendMessage?.fallback && (
                          <p className="text-caption text-destructive">{errors.sendMessage.fallback.message}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      A fallback is required before this workflow can go live. Messages also respect each customer's
                      weekly message limit.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <label className="flex items-center gap-2.5 text-body-sm font-medium">
                  <input type="checkbox" className="accent-brand-primary" {...register('addPoints.enabled')} />
                  {ACTION_LABELS.add_loyalty_points}
                </label>
                {values.addPoints?.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="Points to add"
                      type="number"
                      min={1}
                      className="w-28"
                      aria-invalid={!!errors.addPoints?.points}
                      {...register('addPoints.points', { valueAsNumber: true })}
                    />
                    <span className="text-body-sm text-muted-foreground">points</span>
                    {errors.addPoints?.points && (
                      <p className="text-caption text-destructive">{errors.addPoints.points.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border p-3">
                <label className="flex items-center gap-2.5 text-body-sm font-medium">
                  <input type="checkbox" className="accent-brand-primary" {...register('flag.enabled')} />
                  {ACTION_LABELS.flag_for_review}
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="workflow-timing" className="text-body-sm font-medium">
                  Timing
                </label>
                <select id="workflow-timing" className={selectClassName} {...register('timing')}>
                  <option value="immediate">Immediate</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>

              {values.timing === 'delayed' && (
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
                  {errors.delayMinutes && <p className="text-caption text-destructive">{errors.delayMinutes.message}</p>}
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{values.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger</span>
                <span className="font-medium">
                  {values.triggerType ? TRIGGER_LABELS[values.triggerType as TriggerType] : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Conditions</span>
                {(values.conditionTypes ?? []).length === 0 ? (
                  <span>None — runs for every customer the trigger fires for</span>
                ) : (
                  values.conditionTypes.map((c) => <span key={c}>{CONDITION_LABELS[c as ConditionType]}</span>)
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Actions</span>
                {actionSummary.map((a) => (
                  <span key={a}>{a}</span>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Timing</span>
                <span className="font-medium">
                  {values.timing === 'immediate' ? 'Immediate' : `Delayed by ${values.delayMinutes ?? 0} minutes`}
                </span>
              </div>
              <p className="text-caption text-muted-foreground">
                {isEdit
                  ? 'Saving keeps the current status. A changed draft needs a new test before it can go live.'
                  : 'Saved as a draft. Test it on a customer from its page, then activate it.'}
              </p>
              {save.isError && (
                <p className="text-caption text-destructive">
                  {save.error instanceof Error && save.error.message.startsWith('Pause')
                    ? save.error.message
                    : 'Could not save this workflow. Please try again.'}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 0 ? (
            <Link
              to={isEdit ? `/automation/${workflow.id}` : '/automation/workflows'}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep((step - 1) as Step)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={goNext} className={buttonVariants({ variant: 'default', size: 'sm' })}>
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={save.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create Workflow'}
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
