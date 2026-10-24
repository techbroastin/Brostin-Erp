import { z } from 'zod'
import { MESSAGE_TOKENS, unknownTokens } from '@/features/campaigns/utils/personalize'

/** Shared by campaigns and templates: only the supported {{tokens}} are allowed. */
export const messageSchema = z
  .string()
  .trim()
  .min(1, 'Message content is required.')
  .max(2000, 'Message is too long.')
  .refine((body) => unknownTokens(body).length === 0, {
    message: `Only these placeholders work: ${Object.keys(MESSAGE_TOKENS)
      .map((t) => `{{${t}}}`)
      .join(', ')}.`,
  })

/**
 * Create Campaign form schema — docs/FRONTEND_ARCHITECTURE.md §19:
 * "Every form has a Zod schema, kept next to the feature." Business
 * validation rules beyond basic required/length checks are
 * NOT YET FINALIZED (§19) and are not invented here.
 */
export const campaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Campaign name is required.').max(120, 'Campaign name is too long.'),
    message: messageSchema,
    /** Book 3 §4: every campaign targets a segment — there is no "all customers" option. */
    segmentId: z.string().min(1, 'Pick a segment.'),
    scheduledAt: z.string().nullable(),
    repeatYearly: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.scheduledAt && new Date(v.scheduledAt).getTime() < Date.now()) {
      ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Pick a time in the future.' })
    }
    if (v.repeatYearly && !v.scheduledAt) {
      ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Pick a date to repeat every year.' })
    }
  })

export type CampaignFormValues = z.infer<typeof campaignSchema>
