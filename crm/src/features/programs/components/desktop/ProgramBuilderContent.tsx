import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { TokenHint } from '@/features/campaigns/components/shared/MessagePreview'
import { useSegments } from '@/features/segments/hooks/useSegments'
import { getRewards } from '@/features/loyalty/services/loyaltyService'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import { usePrograms, useSaveProgram } from '@/features/programs/hooks/usePrograms'
import {
  EMPTY_PROGRAM_FORM,
  programSchema,
  toProgramForm,
  toProgramInput,
  type ProgramFormValues,
} from '@/features/programs/schemas/programSchema'
import { COST_OWNER_LABELS, TRIGGER_LABELS, type Program } from '@/features/programs/types/program'
import { describeReward, describeTrigger } from '@/features/programs/utils/programRules'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
const textareaClassName =
  'min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm'

/** Book 3 §2 wizard order: Name → Eligibility → Trigger → Reward → Channel → (cost & rules) → Publish. */
const STEPS = ['Name', 'Who', 'When', 'Reward', 'Message', 'Cost & rules', 'Review'] as const
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

const STEP_FIELDS: Record<Step, (keyof ProgramFormValues)[]> = {
  0: ['name', 'description'],
  1: ['segmentId'],
  2: ['trigger', 'visitInterval'],
  3: ['rewardType', 'rewardPoints', 'rewardId'],
  4: ['messageBody', 'channel', 'fallback'],
  5: ['costOwner', 'exclusiveWith'],
  6: [],
}

function Field({ id, label, error, children }: { id?: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  )
}

/**
 * Program Builder — create or edit a loyalty program (Book 3 §2). Saves
 * as a draft (or keeps a paused program paused); publishing happens on
 * the program page, behind the cost-owner and fallback gate.
 */
export function ProgramBuilderContent({ program }: { program?: Program }) {
  const navigate = useNavigate()
  const isEdit = program !== undefined
  const [step, setStep] = useState<Step>(0)
  const segments = useSegments()
  const rewards = useQuery({ queryKey: ['loyalty', 'rewards'], queryFn: () => getRewards() })
  const others = (usePrograms('all').data ?? []).filter((p) => p.id !== program?.id && p.status !== 'archived')
  const save = useSaveProgram(program?.id)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: program ? toProgramForm(program) : EMPTY_PROGRAM_FORM,
  })
  const v = useWatch({ control }) as ProgramFormValues

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep((step + 1) as Step)
  }
  const onSubmit = handleSubmit((values) =>
    save.mutate(toProgramInput(values), { onSuccess: (saved) => navigate(`/loyalty/programs/${saved.id}`) }),
  )
  const input = toProgramInput(v)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">{isEdit ? 'Edit program' : 'New program'}</h1>
        <DemoDataBadge />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-caption font-medium',
                i === step ? 'bg-brand-primary text-white' : i < step ? 'bg-brand-primary-soft text-brand-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-body-sm', i === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
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
              <Field id="program-name" label="Program name" error={errors.name?.message}>
                <Input id="program-name" {...register('name')} aria-invalid={!!errors.name} />
              </Field>
              <Field id="program-description" label="Description (optional)" error={errors.description?.message}>
                <Input id="program-description" {...register('description')} />
              </Field>
            </>
          )}

          {step === 1 && (
            <Field id="program-segment" label="Who can earn this?">
              <select id="program-segment" className={selectClassName} {...register('segmentId')}>
                <option value="">All customers</option>
                {(segments.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.memberCount} customers now)
                  </option>
                ))}
              </select>
              <p className="text-caption text-muted-foreground">Archived customers never earn rewards.</p>
            </Field>
          )}

          {step === 2 && (
            <>
              <Field id="program-trigger" label="When is it earned?">
                <select id="program-trigger" className={selectClassName} {...register('trigger')}>
                  {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              {v.trigger === 'every_nth_visit' && (
                <Field id="program-interval" label="Every how many visits?" error={errors.visitInterval?.message}>
                  <Input
                    id="program-interval"
                    type="number"
                    min={2}
                    className="w-28"
                    aria-invalid={!!errors.visitInterval}
                    {...register('visitInterval', { valueAsNumber: true })}
                  />
                </Field>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Field id="program-reward-type" label="Reward">
                <select id="program-reward-type" className={selectClassName} {...register('rewardType')}>
                  <option value="points_per_spend">Points for every ₹100 spent</option>
                  <option value="fixed_points">A fixed number of points</option>
                  <option value="catalogue_reward">An item from the rewards catalogue</option>
                </select>
              </Field>
              {v.rewardType === 'catalogue_reward' ? (
                <Field id="program-reward-item" label="Catalogue reward" error={errors.rewardId?.message}>
                  <select id="program-reward-item" className={selectClassName} {...register('rewardId')}>
                    <option value="">Choose a reward…</option>
                    {(rewards.data ?? []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field
                  id="program-points"
                  label={v.rewardType === 'points_per_spend' ? 'Points per ₹100' : 'Points'}
                  error={errors.rewardPoints?.message}
                >
                  <Input
                    id="program-points"
                    type="number"
                    min={1}
                    className="w-28"
                    aria-invalid={!!errors.rewardPoints}
                    {...register('rewardPoints', { valueAsNumber: true })}
                  />
                </Field>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <Field id="program-message" label="Message telling the customer" error={errors.messageBody?.message}>
                <textarea id="program-message" className={textareaClassName} aria-invalid={!!errors.messageBody} {...register('messageBody')} />
                <TokenHint />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field id="program-channel" label="Send by">
                  <select id="program-channel" className={selectClassName} {...register('channel')}>
                    {Object.entries(MESSAGE_CHANNEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="program-fallback" label="If that fails or they opted out" error={errors.fallback?.message}>
                  <select id="program-fallback" className={selectClassName} {...register('fallback')}>
                    <option value="">Choose a fallback…</option>
                    {Object.entries(MESSAGE_CHANNEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        Try {label}
                      </option>
                    ))}
                    <option value="log_only">Log only (don't send)</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Field id="program-cost-owner" label="Who pays for the reward?">
                <select id="program-cost-owner" className={selectClassName} {...register('costOwner')}>
                  <option value="">Not decided yet</option>
                  {Object.entries(COST_OWNER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-caption text-muted-foreground">Required before the program can be published.</p>
              </Field>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1 text-body-sm font-medium">Can't be combined with (optional)</legend>
                {others.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">No other programs yet.</p>
                ) : (
                  others.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-body-sm">
                      <input
                        type="checkbox"
                        className="accent-brand-primary"
                        checked={(v.exclusiveWith ?? []).includes(p.id)}
                        onChange={(e) =>
                          setValue(
                            'exclusiveWith',
                            e.target.checked ? [...(v.exclusiveWith ?? []), p.id] : (v.exclusiveWith ?? []).filter((x) => x !== p.id),
                          )
                        }
                      />
                      {p.name}
                    </label>
                  ))
                )}
                <p className="text-caption text-muted-foreground">
                  If both apply on the same visit, only the older program rewards. This is set on both programs.
                </p>
              </fieldset>
            </>
          )}

          {step === 6 && (
            <dl className="flex flex-col gap-2.5 text-body-sm">
              {[
                ['Name', input.name || '—'],
                ['Who', input.segmentId ? (segments.data?.find((s) => s.id === input.segmentId)?.name ?? '—') : 'All customers'],
                ['When', describeTrigger(input)],
                ['Reward', describeReward(input.reward, rewards.data ?? [])],
                ['Paid by', input.costOwner ? COST_OWNER_LABELS[input.costOwner] : 'Not decided yet'],
                ["Can't combine with", others.filter((p) => input.exclusiveWith.includes(p.id)).map((p) => p.name).join(', ') || 'None'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
              <p className="mt-1 text-caption text-muted-foreground">
                {isEdit ? 'Saving keeps the current status.' : 'Saved as a draft.'} Publish it from the program page once
                the cost owner and message fallback are set.
              </p>
              {save.isError && (
                <p className="text-caption text-destructive">
                  {save.error instanceof Error && /already exists|Pause|Archived/.test(save.error.message)
                    ? save.error.message
                    : 'Could not save this program. Please try again.'}
                </p>
              )}
            </dl>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 0 ? (
            <Link
              to={isEdit ? `/loyalty/programs/${program.id}` : '/loyalty/programs'}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Cancel
            </Link>
          ) : (
            <button type="button" onClick={() => setStep((step - 1) as Step)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Back
            </button>
          )}
          {step < 6 ? (
            <button type="button" onClick={next} className={buttonVariants({ variant: 'default', size: 'sm' })}>
              Next
            </button>
          ) : (
            <button type="button" onClick={onSubmit} disabled={save.isPending} className={buttonVariants({ variant: 'default', size: 'sm' })}>
              {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
