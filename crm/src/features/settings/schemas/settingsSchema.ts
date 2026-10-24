import { z } from 'zod'

/**
 * Settings form schemas — docs/FRONTEND_ARCHITECTURE.md §19: "Every
 * form has a Zod schema, kept next to the feature." Business
 * validation rules beyond basic required/format checks are
 * NOT YET FINALIZED and are not invented here.
 */
export const generalSettingsSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required.').max(120, 'Business name is too long.'),
  contactEmail: z.string().trim().min(1, 'Contact email is required.').email('Enter a valid email address.'),
  contactPhone: z.string().trim().min(1, 'Contact phone is required.').max(30, 'Phone number is too long.'),
  /** Optional — Book 3 §9's public-review destination. Empty string means "not configured". */
  publicReviewUrl: z.union([z.string().trim().url('Enter a valid URL.'), z.literal('')]),
})

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>

export const addUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name is too long.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: z.enum(['admin', 'manager']),
})

export type AddUserFormValues = z.infer<typeof addUserSchema>
