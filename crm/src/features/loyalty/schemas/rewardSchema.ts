import { z } from 'zod'

/** Reward form schema — owner-configured catalogue entry (no finalized reward model). */
export const rewardSchema = z.object({
  name: z.string().trim().min(1, 'Reward name is required.').max(60, 'Reward name is too long.'),
  description: z.string().trim().max(160, 'Description is too long.'),
  pointCost: z
    .number({ message: 'Enter a point cost.' })
    .int('Use a whole number of points.')
    .min(1, 'Point cost must be at least 1.')
    .max(100_000, 'Point cost is too high.'),
})

export type RewardFormValues = z.infer<typeof rewardSchema>
