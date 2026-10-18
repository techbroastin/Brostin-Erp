import { z } from 'zod'

/**
 * Create Campaign form schema — docs/FRONTEND_ARCHITECTURE.md §19:
 * "Every form has a Zod schema, kept next to the feature." Business
 * validation rules beyond basic required/length checks are
 * NOT YET FINALIZED (§19) and are not invented here.
 */
export const campaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required.').max(120, 'Campaign name is too long.'),
  message: z.string().trim().min(1, 'Message content is required.').max(2000, 'Message is too long.'),
  audienceCustomerIds: z.array(z.string()).min(1, 'Select at least one customer.'),
  scheduledAt: z.string().nullable(),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>
