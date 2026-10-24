import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { useSaveReward } from '@/features/loyalty/hooks/useRewards'
import { rewardSchema, type RewardFormValues } from '@/features/loyalty/schemas/rewardSchema'
import type { Reward } from '@/features/loyalty/types/loyalty'

/**
 * Add or edit one catalogue reward (docs/NAVIGATION.md §10 "view/manage
 * rewards"). Desktop Admin only. The parent remounts it with a `key` per
 * reward so the fields always start from the chosen reward.
 */
export function RewardForm({ reward, onDone }: { reward?: Reward; onDone: () => void }) {
  const isEdit = reward !== undefined
  const save = useSaveReward(reward?.id)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: reward
      ? { name: reward.name, description: reward.description, pointCost: reward.pointCost }
      : { name: '', description: '', pointCost: 100 },
  })

  const onSubmit = handleSubmit((values) => save.mutate(values, { onSuccess: onDone }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? `Edit ${reward.name}` : 'New reward'}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)] items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reward-name" className="text-body-sm font-medium">
            Reward name
          </label>
          <Input id="reward-name" {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reward-description" className="text-body-sm font-medium">
            Description
          </label>
          <Input id="reward-description" {...register('description')} aria-invalid={!!errors.description} />
          {errors.description && <p className="text-caption text-destructive">{errors.description.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reward-points" className="text-body-sm font-medium">
            Point cost
          </label>
          <Input
            id="reward-points"
            type="number"
            min={1}
            step={1}
            {...register('pointCost', { valueAsNumber: true })}
            aria-invalid={!!errors.pointCost}
          />
          {errors.pointCost && <p className="text-caption text-destructive">{errors.pointCost.message}</p>}
        </div>
        {save.isError && (
          <p className="col-span-3 text-caption text-destructive">
            {save.error instanceof Error && save.error.message.includes('already exists')
              ? save.error.message
              : 'Could not save this reward. Please try again.'}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={save.isPending}
          className={buttonVariants({ variant: 'default', size: 'sm' })}
        >
          {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add reward'}
        </button>
      </CardFooter>
    </Card>
  )
}
