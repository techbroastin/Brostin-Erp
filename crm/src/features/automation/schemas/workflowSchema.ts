import { z } from 'zod'

/**
 * Create Workflow form schema — docs/FRONTEND_ARCHITECTURE.md §19:
 * "Every form has a Zod schema, kept next to the feature." Business
 * validation rules beyond basic required checks are NOT YET FINALIZED
 * and are not invented here.
 */
export const workflowSchema = z
  .object({
    name: z.string().trim().min(1, 'Workflow name is required.').max(120, 'Workflow name is too long.'),
    triggerType: z.string().min(1, 'Select a trigger.'),
    conditionTypes: z.array(z.string()),
    actionTypes: z.array(z.string()).min(1, 'Select at least one action.'),
    timing: z.enum(['immediate', 'delayed']),
    delayMinutes: z.number().nullable(),
  })
  .refine((data) => data.timing !== 'delayed' || (data.delayMinutes ?? 0) > 0, {
    message: 'Enter a delay in minutes.',
    path: ['delayMinutes'],
  })

export type WorkflowFormValues = z.infer<typeof workflowSchema>
