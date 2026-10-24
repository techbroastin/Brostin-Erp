import type { Customer } from '@/features/customers/types/customer'
import type {
  NumericOperator,
  SegmentDefinition,
  SegmentRule,
  SegmentRuleField,
  SegmentRuleOperator,
} from '@/features/segments/types/segment'

const DAY_MS = 24 * 60 * 60 * 1000

type FieldType = 'number' | 'text' | 'boolean'

export const SEGMENT_FIELD_META: Record<
  SegmentRuleField,
  { label: string; type: FieldType; unit?: string }
> = {
  lifetime_spend: { label: 'Lifetime spend', type: 'number', unit: '₹' },
  order_count: { label: 'Number of orders', type: 'number' },
  days_since_last_order: { label: 'Days since last order', type: 'number' },
  preferred_outlet: { label: 'Preferred outlet', type: 'text' },
  preference_tag: { label: 'Preference tag', type: 'text' },
  whatsapp_opt_in: { label: 'WhatsApp opt-in', type: 'boolean' },
}

export const SEGMENT_FIELDS = Object.keys(SEGMENT_FIELD_META) as SegmentRuleField[]

export const NUMERIC_OPERATORS: NumericOperator[] = ['gt', 'gte', 'eq', 'lte', 'lt']

export const OPERATOR_LABELS: Record<SegmentRuleOperator, string> = {
  gt: 'more than',
  gte: 'at least',
  eq: 'exactly',
  lte: 'at most',
  lt: 'less than',
  is: 'is',
}

export function isNumericField(field: SegmentRuleField): boolean {
  return SEGMENT_FIELD_META[field].type === 'number'
}

export function operatorsForField(field: SegmentRuleField): SegmentRuleOperator[] {
  return isNumericField(field) ? NUMERIC_OPERATORS : ['is']
}

/** The rule a field starts with when picked in the builder. */
export function defaultRuleForField(field: SegmentRuleField): SegmentRule {
  const meta = SEGMENT_FIELD_META[field]
  return {
    field,
    operator: meta.type === 'number' ? 'gte' : 'is',
    value: meta.type === 'boolean' ? 'true' : '',
  }
}

function compare(actual: number, operator: SegmentRuleOperator, expected: number): boolean {
  switch (operator) {
    case 'eq':
      return actual === expected
    case 'gt':
      return actual > expected
    case 'gte':
      return actual >= expected
    case 'lt':
      return actual < expected
    case 'lte':
      return actual <= expected
    default:
      return false
  }
}

/** Whole days since the last order, or null for a customer who never ordered. */
export function daysSinceLastOrder(customer: Customer, now: number): number | null {
  if (!customer.lastOrderAt) return null
  return Math.floor((now - new Date(customer.lastOrderAt).getTime()) / DAY_MS)
}

export function matchesRule(customer: Customer, rule: SegmentRule, now: number): boolean {
  switch (rule.field) {
    case 'lifetime_spend':
      return compare(customer.lifetimeSpend, rule.operator, Number(rule.value))
    case 'order_count':
      return compare(customer.orderCount, rule.operator, Number(rule.value))
    case 'days_since_last_order': {
      // A customer with no orders has no "last order" to measure from.
      const days = daysSinceLastOrder(customer, now)
      return days !== null && compare(days, rule.operator, Number(rule.value))
    }
    case 'preferred_outlet':
      return customer.preferredOutlets.includes(rule.value)
    case 'preference_tag':
      return customer.preferenceTags.includes(rule.value)
    case 'whatsapp_opt_in':
      return customer.whatsappOptIn === (rule.value === 'true')
  }
}

/** A definition with no rules matches nobody — never "all customers" by accident. */
export function matchesDefinition(
  customer: Customer,
  definition: SegmentDefinition,
  now: number,
): boolean {
  if (definition.rules.length === 0) return false
  return definition.match === 'all'
    ? definition.rules.every((rule) => matchesRule(customer, rule, now))
    : definition.rules.some((rule) => matchesRule(customer, rule, now))
}

export function evaluateSegment(
  definition: SegmentDefinition,
  customers: Customer[],
  now: number = Date.now(),
): Customer[] {
  return customers.filter((customer) => matchesDefinition(customer, definition, now))
}

/** Human-readable rule, e.g. "Lifetime spend at least ₹3,000". */
export function describeRule(rule: SegmentRule): string {
  const meta = SEGMENT_FIELD_META[rule.field]
  if (meta.type === 'boolean') {
    return `${meta.label}: ${rule.value === 'true' ? 'opted in' : 'not opted in'}`
  }
  if (meta.type === 'text') {
    return `${meta.label} is ${rule.value || '—'}`
  }
  const amount = Number(rule.value).toLocaleString('en-IN')
  return `${meta.label} ${OPERATOR_LABELS[rule.operator]} ${meta.unit ?? ''}${amount}`
}
