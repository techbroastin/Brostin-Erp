import { z } from 'zod'
import { SEGMENT_FIELDS, SEGMENT_FIELD_META, operatorsForField } from '@/features/segments/utils/segmentRules'
import type { SegmentRuleField, SegmentRuleOperator } from '@/features/segments/types/segment'

const MAX_RULES = 10

export const ruleSchema = z
  .object({
    field: z.enum(SEGMENT_FIELDS as [SegmentRuleField, ...SegmentRuleField[]]),
    operator: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'is'] as [SegmentRuleOperator, ...SegmentRuleOperator[]]),
    value: z.string().trim(),
  })
  .superRefine((rule, ctx) => {
    if (!operatorsForField(rule.field).includes(rule.operator)) {
      ctx.addIssue({ code: 'custom', path: ['operator'], message: 'Pick a valid comparison.' })
    }
    const type = SEGMENT_FIELD_META[rule.field].type
    if (type === 'number' && !/^\d+$/.test(rule.value)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Enter a whole number.' })
    }
    if (type === 'text' && rule.value === '') {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Pick a value.' })
    }
    if (type === 'boolean' && rule.value !== 'true' && rule.value !== 'false') {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Pick a value.' })
    }
  })

/**
 * Segment Builder form schema — docs/FRONTEND_ARCHITECTURE.md §19.
 * At least one rule is required so a custom segment can never silently
 * mean "all customers" (Book 3 §4's targeting rule depends on this).
 */
export const segmentSchema = z.object({
  name: z.string().trim().min(1, 'Segment name is required.').max(80, 'Segment name is too long.'),
  description: z.string().trim().max(240, 'Description is too long.'),
  match: z.enum(['all', 'any']),
  rules: z
    .array(ruleSchema)
    .min(1, 'Add at least one rule.')
    .max(MAX_RULES, `A segment can have at most ${MAX_RULES} rules.`),
})

export type SegmentFormValues = z.infer<typeof segmentSchema>

export { MAX_RULES }
