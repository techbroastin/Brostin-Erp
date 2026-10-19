import { z } from 'zod'

/**
 * Add Connection form schema — docs/FRONTEND_ARCHITECTURE.md §19:
 * "Every form has a Zod schema, kept next to the feature." Business
 * validation rules beyond basic required checks are NOT YET FINALIZED
 * and are not invented here.
 */
export const addPosConnectionSchema = z
  .object({
    vendor: z.enum(['manageme', 'petpooja']),
    label: z.string().trim().min(1, 'Connection label is required.').max(120, 'Label is too long.'),
    authMethod: z.enum(['api_key', 'oauth2', 'basic']),
    syncMode: z.enum(['polling', 'webhook']),
    pollingIntervalMinutes: z.number().nullable(),
  })
  .refine((data) => data.syncMode !== 'polling' || (data.pollingIntervalMinutes ?? 0) > 0, {
    message: 'Enter a polling interval in minutes.',
    path: ['pollingIntervalMinutes'],
  })

export type AddPosConnectionFormValues = z.infer<typeof addPosConnectionSchema>
