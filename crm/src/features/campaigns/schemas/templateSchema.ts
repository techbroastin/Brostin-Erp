import { z } from 'zod'
import { messageSchema } from '@/features/campaigns/schemas/campaignSchema'

/** Template editor form schema. `segmentId` '' means "suits any segment". */
export const templateSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required.').max(80, 'Template name is too long.'),
  occasion: z.enum(['festival', 'launch', 'generic']),
  segmentId: z.string(),
  body: messageSchema,
})

export type TemplateFormValues = z.infer<typeof templateSchema>
