import { z } from 'zod'
import { messageSchema } from '@/features/campaigns/schemas/campaignSchema'
import type { Program, ProgramInput, ProgramReward, ProgramTrigger } from '@/features/programs/types/program'

const MAX_POINTS = 1000

/**
 * Program Builder form schema — Book 3 §2 wizard: Name → Eligibility →
 * Trigger → Reward → Channel → Cost & rules. Cost owner and message
 * fallback may be left unset in a draft; the publish gate requires them.
 */
export const programSchema = z
  .object({
    name: z.string().trim().min(1, 'Program name is required.').max(80, 'Program name is too long.'),
    description: z.string().trim().max(240, 'Description is too long.'),
    /** '' = all customers. */
    segmentId: z.string(),
    trigger: z.enum(['order_placed', 'every_nth_visit', 'birthday']),
    visitInterval: z.number().nullable(),
    rewardType: z.enum(['points_per_spend', 'fixed_points', 'catalogue_reward']),
    rewardPoints: z.number(),
    rewardId: z.string(),
    messageBody: z.string(),
    channel: z.enum(['whatsapp', 'sms', 'email']),
    fallback: z.enum(['', 'whatsapp', 'sms', 'email', 'log_only']),
    costOwner: z.enum(['', 'brand', 'outlet']),
    exclusiveWith: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    if (v.trigger === 'every_nth_visit') {
      const n = v.visitInterval
      if (n === null || !Number.isInteger(n) || n < 2 || n > 100) issue('visitInterval', 'Enter a number of visits from 2 to 100.')
    }
    if (v.rewardType !== 'catalogue_reward') {
      if (!Number.isInteger(v.rewardPoints) || v.rewardPoints < 1 || v.rewardPoints > MAX_POINTS) {
        issue('rewardPoints', `Enter 1 to ${MAX_POINTS} points.`)
      }
    } else if (!v.rewardId) {
      issue('rewardId', 'Pick a reward from the catalogue.')
    }
    const message = messageSchema.safeParse(v.messageBody)
    if (!message.success) issue('messageBody', message.error.issues[0].message)
    if (v.fallback === v.channel) issue('fallback', 'Pick a different channel than the main one.')
  })

export type ProgramFormValues = z.infer<typeof programSchema>

export const EMPTY_PROGRAM_FORM: ProgramFormValues = {
  name: '',
  description: '',
  segmentId: '',
  trigger: 'order_placed',
  visitInterval: 5,
  rewardType: 'points_per_spend',
  rewardPoints: 5,
  rewardId: '',
  messageBody: '',
  channel: 'whatsapp',
  fallback: '',
  costOwner: '',
  exclusiveWith: [],
}

export function toProgramInput(v: ProgramFormValues): ProgramInput {
  const reward: ProgramReward =
    v.rewardType === 'catalogue_reward'
      ? { type: 'catalogue_reward', rewardId: v.rewardId }
      : { type: v.rewardType, points: v.rewardPoints }
  return {
    name: v.name.trim(),
    description: v.description.trim(),
    segmentId: v.segmentId || null,
    trigger: v.trigger as ProgramTrigger,
    visitInterval: v.trigger === 'every_nth_visit' ? v.visitInterval : null,
    reward,
    message: { body: v.messageBody.trim(), channel: v.channel, fallback: v.fallback === '' ? null : v.fallback },
    costOwner: v.costOwner === '' ? null : v.costOwner,
    exclusiveWith: v.exclusiveWith,
  }
}

export function toProgramForm(p: Program): ProgramFormValues {
  return {
    name: p.name,
    description: p.description,
    segmentId: p.segmentId ?? '',
    trigger: p.trigger,
    visitInterval: p.visitInterval ?? EMPTY_PROGRAM_FORM.visitInterval,
    rewardType: p.reward.type,
    rewardPoints: p.reward.type === 'catalogue_reward' ? EMPTY_PROGRAM_FORM.rewardPoints : p.reward.points,
    rewardId: p.reward.type === 'catalogue_reward' ? p.reward.rewardId : '',
    messageBody: p.message.body,
    channel: p.message.channel,
    fallback: p.message.fallback ?? '',
    costOwner: p.costOwner ?? '',
    exclusiveWith: p.exclusiveWith,
  }
}
