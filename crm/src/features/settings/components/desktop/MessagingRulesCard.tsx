import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { SettingsErrorState } from '@/features/settings/components/shared/SettingsErrorState'
import { useMessagingRules, useUpdateMessagingRules } from '@/features/settings/hooks/useMessagingRules'
import {
  MAX_WEEKLY_CAP,
  messagingRulesSchema,
  type MessagingRulesFormValues,
} from '@/features/settings/schemas/settingsSchema'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'

/**
 * Book 3 §13 customer messaging rules, used by the Notification Engine
 * for every campaign, program and workflow message. Channel order is
 * the fallback order; a switched-off channel is never tried. Email is
 * listed but no customer has an email address yet, so it is skipped
 * in practice — the Message Log shows this as "no address".
 */
export function MessagingRulesCard() {
  const { data: rules, isPending, isError, refetch } = useMessagingRules()
  const updateRules = useUpdateMessagingRules()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<MessagingRulesFormValues>({
    resolver: zodResolver(messagingRulesSchema),
    defaultValues: { weeklyCapPerCustomer: 2, channelOrder: [] },
  })

  useEffect(() => {
    if (rules) reset(rules)
  }, [rules, reset])

  const { fields, move } = useFieldArray({ control, name: 'channelOrder' })
  const channelOrder = useWatch({ control, name: 'channelOrder' })

  const onSubmit = handleSubmit((values) => updateRules.mutate(values))

  if (isError) {
    return <SettingsErrorState message="Couldn't load messaging rules." onRetry={() => refetch()} />
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardSectionHeading>Customer messaging rules</CardSectionHeading>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isPending ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="weekly-cap" className="text-body-sm font-medium">
                Most messages per customer per week
              </label>
              <Input
                id="weekly-cap"
                type="number"
                min={1}
                max={MAX_WEEKLY_CAP}
                className="w-24"
                aria-invalid={!!errors.weeklyCapPerCustomer}
                {...register('weeklyCapPerCustomer', { valueAsNumber: true })}
              />
              {errors.weeklyCapPerCustomer && (
                <p className="text-caption text-destructive">{errors.weeklyCapPerCustomer.message}</p>
              )}
              <p className="text-caption text-muted-foreground">
                Counts every campaign and program together, over the last 7 days. Extra messages are held back.
              </p>
            </div>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-body-sm font-medium">Channel order</legend>
              <ol className="flex flex-col gap-1.5">
                {fields.map((field, index) => (
                  <li key={field.id} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="w-4 text-caption text-muted-foreground">{index + 1}.</span>
                    <label className="flex flex-1 items-center gap-2 text-body-sm">
                      <input
                        type="checkbox"
                        className="accent-brand-primary"
                        {...register(`channelOrder.${index}.enabled`)}
                      />
                      <span className={channelOrder?.[index]?.enabled ? '' : 'text-muted-foreground line-through'}>
                        {MESSAGE_CHANNEL_LABELS[field.channel]}
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Move ${MESSAGE_CHANNEL_LABELS[field.channel]} up`}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${MESSAGE_CHANNEL_LABELS[field.channel]} down`}
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </li>
                ))}
              </ol>
              {errors.channelOrder?.root && (
                <p className="text-caption text-destructive">{errors.channelOrder.root.message}</p>
              )}
              {errors.channelOrder?.message && (
                <p className="text-caption text-destructive">{errors.channelOrder.message}</p>
              )}
              <p className="text-caption text-muted-foreground">
                If a customer opted out of a channel, or it fails, the next one is tried. If none works, the message is
                only logged.
              </p>
            </fieldset>

            {updateRules.isError && (
              <p className="text-caption text-destructive">Could not save these rules. Please try again.</p>
            )}
            {updateRules.isSuccess && !isDirty && <p className="text-caption text-success">Rules saved.</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || updateRules.isPending || !isDirty}
          className={buttonVariants({ variant: 'default', size: 'sm' })}
        >
          {updateRules.isPending ? 'Saving…' : 'Save rules'}
        </button>
      </CardFooter>
    </Card>
  )
}
