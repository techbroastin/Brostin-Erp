import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useSaveSegment, useSegmentFieldOptions, useSegmentPreview } from '@/features/segments/hooks/useSegments'
import { MAX_RULES, ruleSchema, segmentSchema, type SegmentFormValues } from '@/features/segments/schemas/segmentSchema'
import {
  OPERATOR_LABELS,
  SEGMENT_FIELDS,
  SEGMENT_FIELD_META,
  defaultRuleForField,
  operatorsForField,
} from '@/features/segments/utils/segmentRules'
import type { Segment, SegmentDefinition, SegmentRuleField } from '@/features/segments/types/segment'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const DEFAULT_VALUES: SegmentFormValues = {
  name: '',
  description: '',
  match: 'all',
  rules: [defaultRuleForField('lifetime_spend')],
}

/**
 * Segment Builder — Book 3 §10 custom segments (e.g. "spent >₹5000 AND
 * visited Trivandrum outlet"). Single screen: definition on the left,
 * live Segment Membership Preview on the right. The preview only uses
 * complete rules, so a half-typed rule never shows a misleading count.
 * Saving stores the definition; the saved membership itself is
 * refreshed by the nightly recalculation.
 */
export function DesktopSegmentBuilderContent({ segment }: { segment?: Segment }) {
  const navigate = useNavigate()
  const isEdit = segment !== undefined
  const saveSegment = useSaveSegment(segment?.id)
  const { data: fieldOptions } = useSegmentFieldOptions()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentSchema),
    defaultValues: segment
      ? { name: segment.name, description: segment.description, match: segment.match, rules: segment.rules }
      : DEFAULT_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'rules' })
  const match = useWatch({ control, name: 'match' })
  const rules = useWatch({ control, name: 'rules' })

  // Debounce a serialized definition: a fresh object every render would
  // restart the debounce timer forever.
  const definitionKey = JSON.stringify({
    match,
    rules: (rules ?? []).filter((rule) => ruleSchema.safeParse(rule).success),
  })
  const debouncedKey = useDebouncedValue(definitionKey)
  const definition = useMemo(() => JSON.parse(debouncedKey) as SegmentDefinition, [debouncedKey])
  const preview = useSegmentPreview(definition, definition.rules.length > 0)

  const onFieldChange = (index: number, field: SegmentRuleField) => {
    const next = defaultRuleForField(field)
    setValue(`rules.${index}.field`, next.field)
    setValue(`rules.${index}.operator`, next.operator)
    setValue(`rules.${index}.value`, next.value)
  }

  const onSubmit = handleSubmit((values) => {
    saveSegment.mutate(values, {
      onSuccess: (saved) => navigate(`/customers/segments/${saved.id}`),
    })
  })

  const textOptions = (field: SegmentRuleField): string[] =>
    field === 'preferred_outlet' ? (fieldOptions?.outlets ?? []) : (fieldOptions?.preferenceTags ?? [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{isEdit ? 'Edit segment' : 'New segment'}</h1>
          <DemoDataBadge />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Definition</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="segment-name" className="text-body-sm font-medium">
                Segment name
              </label>
              <Input id="segment-name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="segment-description" className="text-body-sm font-medium">
                Description (optional)
              </label>
              <Input id="segment-description" {...register('description')} aria-invalid={!!errors.description} />
              {errors.description && <p className="text-caption text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-body-sm">
                <span>Include customers who match</span>
                <select aria-label="Match mode" className={selectClassName} {...register('match')}>
                  <option value="all">all rules</option>
                  <option value="any">any rule</option>
                </select>
              </div>

              {fields.map((item, index) => {
                const rule = rules?.[index] ?? item
                const meta = SEGMENT_FIELD_META[rule.field]
                const ruleErrors = errors.rules?.[index]
                return (
                  <div key={item.id} className="flex flex-col gap-1 rounded-lg border border-border p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Rule ${index + 1} field`}
                        className={selectClassName}
                        value={rule.field}
                        onChange={(e) => onFieldChange(index, e.target.value as SegmentRuleField)}
                      >
                        {SEGMENT_FIELDS.map((field) => (
                          <option key={field} value={field}>
                            {SEGMENT_FIELD_META[field].label}
                          </option>
                        ))}
                      </select>

                      {meta.type === 'number' && (
                        <>
                          <select
                            aria-label={`Rule ${index + 1} comparison`}
                            className={selectClassName}
                            {...register(`rules.${index}.operator`)}
                          >
                            {operatorsForField(rule.field).map((op) => (
                              <option key={op} value={op}>
                                {OPERATOR_LABELS[op]}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            {meta.unit && <span className="text-body-sm text-muted-foreground">{meta.unit}</span>}
                            <Input
                              aria-label={`Rule ${index + 1} value`}
                              inputMode="numeric"
                              className="h-8 w-28"
                              aria-invalid={!!ruleErrors?.value}
                              {...register(`rules.${index}.value`)}
                            />
                          </div>
                        </>
                      )}

                      {meta.type === 'text' && (
                        <>
                          <span className="text-body-sm text-muted-foreground">is</span>
                          <select
                            aria-label={`Rule ${index + 1} value`}
                            className={selectClassName}
                            aria-invalid={!!ruleErrors?.value}
                            {...register(`rules.${index}.value`)}
                          >
                            <option value="">Select…</option>
                            {textOptions(rule.field).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {meta.type === 'boolean' && (
                        <>
                          <span className="text-body-sm text-muted-foreground">is</span>
                          <select
                            aria-label={`Rule ${index + 1} value`}
                            className={selectClassName}
                            {...register(`rules.${index}.value`)}
                          >
                            <option value="true">opted in</option>
                            <option value="false">not opted in</option>
                          </select>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label={`Remove rule ${index + 1}`}
                        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {(ruleErrors?.value || ruleErrors?.operator) && (
                      <p className="text-caption text-destructive">
                        {ruleErrors.value?.message ?? ruleErrors.operator?.message}
                      </p>
                    )}
                  </div>
                )
              })}

              {errors.rules?.root && <p className="text-caption text-destructive">{errors.rules.root.message}</p>}
              {errors.rules?.message && <p className="text-caption text-destructive">{errors.rules.message}</p>}

              <button
                type="button"
                onClick={() => append(defaultRuleForField('order_count'))}
                disabled={fields.length >= MAX_RULES}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
              >
                <Plus className="size-4" />
                Add rule
              </button>
            </div>

            {saveSegment.isError && (
              <p className="text-caption text-destructive">
                {saveSegment.error instanceof Error && saveSegment.error.message.includes('already exists')
                  ? saveSegment.error.message
                  : 'Could not save this segment. Please try again.'}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link
              to={isEdit ? `/customers/segments/${segment.id}` : '/customers/segments'}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saveSegment.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {saveSegment.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create segment'}
            </button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3" aria-live="polite">
            {definition.rules.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">Complete a rule to see who matches.</p>
            ) : preview.isError ? (
              <p className="text-body-sm text-destructive">Couldn't load the preview.</p>
            ) : !preview.data ? (
              <p className="text-body-sm text-muted-foreground">Calculating…</p>
            ) : (
              <>
                <div>
                  <p className="text-h2 font-semibold">{preview.data.memberCount}</p>
                  <p className="text-body-sm text-muted-foreground">
                    of {preview.data.totalCustomers} customers match right now
                    {preview.isFetching && ' · updating…'}
                  </p>
                </div>
                {preview.data.sample.length > 0 && (
                  <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                    {preview.data.sample.map((customer) => (
                      <li key={customer.id} className="flex justify-between gap-2 px-2.5 py-1.5 text-body-sm">
                        <span className="truncate">{customer.name}</span>
                        <span className="shrink-0 text-muted-foreground">{customer.orderCount} orders</span>
                      </li>
                    ))}
                  </ul>
                )}
                {preview.data.memberCount > preview.data.sample.length && (
                  <p className="text-caption text-muted-foreground">
                    and {preview.data.memberCount - preview.data.sample.length} more
                  </p>
                )}
              </>
            )}
            <p className="border-t border-border pt-3 text-caption text-muted-foreground">
              Saved segment membership is recalculated nightly, not on every order.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
