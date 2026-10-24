import type { Customer } from '@/features/customers/types/customer'

/**
 * Segmentation Engine domain types — Book 3 §10. Mock-only: no segment
 * table exists in the backend yet. Per docs/NAVIGATION.md §8.3 the
 * pre-built segment definitions are illustrative, NOT final database
 * segments.
 */

/** Customer attributes a rule can test. Each maps onto a Customer field. */
export type SegmentRuleField =
  | 'lifetime_spend'
  | 'order_count'
  | 'days_since_last_order'
  | 'preferred_outlet'
  | 'preference_tag'
  | 'whatsapp_opt_in'

export type NumericOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte'
export type SegmentRuleOperator = NumericOperator | 'is'

/**
 * One condition. `value` is always a string so the builder form can
 * hold it directly; it is parsed per field type at evaluation time
 * (number for numeric fields, 'true'/'false' for WhatsApp opt-in).
 */
export type SegmentRule = {
  field: SegmentRuleField
  operator: SegmentRuleOperator
  value: string
}

/** 'all' = every rule must match (AND), 'any' = at least one (OR). */
export type SegmentMatch = 'all' | 'any'

/** Book 3 §10: pre-built segments are auto-maintained; custom ones are user-built. */
export type SegmentKind = 'prebuilt' | 'custom'

export type SegmentDefinition = {
  match: SegmentMatch
  rules: SegmentRule[]
}

export type Segment = SegmentDefinition & {
  id: string
  name: string
  description: string
  kind: SegmentKind
  createdAt: string
  updatedAt: string
  /**
   * When membership was last recalculated. Book 3 §10: segments
   * recalculate on a schedule (nightly), not on every transaction.
   * Null for a segment created since the last run.
   */
  lastCalculatedAt: string | null
}

export type SegmentSummary = Segment & { memberCount: number }

export type SegmentDetail = {
  segment: Segment
  members: Customer[]
}

export type SegmentPreview = {
  memberCount: number
  totalCustomers: number
  sample: Customer[]
}

export type SegmentInput = SegmentDefinition & {
  name: string
  description: string
}

/** Values the builder offers for the text-valued rule fields. */
export type SegmentFieldOptions = {
  outlets: string[]
  preferenceTags: string[]
}
