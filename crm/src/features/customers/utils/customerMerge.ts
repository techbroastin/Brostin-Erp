import type { Customer } from '@/features/customers/types/customer'
import { formatCalendarDate } from '@/features/customers/utils/customerFormat'

/**
 * Book 3 §1 merge key: the phone number, compared as its last 10 digits
 * so "+91 97000 01370", "9700001370" and "+91-97000-01370" match.
 */
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

/** Active customers sharing a phone number, as groups of 2+ (largest first). */
export function findDuplicateGroups(customers: Customer[]): Customer[][] {
  const byKey = new Map<string, Customer[]>()
  for (const c of customers) {
    if (c.archivedAt) continue
    const key = phoneKey(c.phone)
    if (key.length < 10) continue
    byKey.set(key, [...(byKey.get(key) ?? []), c])
  }
  return [...byKey.values()].filter((g) => g.length > 1).sort((a, b) => b.length - a.length)
}

/**
 * Fields where the two records disagree and a person must choose
 * (Book 3 §1: never auto-overwritten silently). A blank on one side is
 * not a conflict — the filled value is kept.
 */
export type MergeConflictField = 'name' | 'phone' | 'dateOfBirth' | 'anniversaryDate' | 'whatsappOptIn'

export const MERGE_FIELD_LABELS: Record<MergeConflictField, string> = {
  name: 'Name',
  phone: 'Phone',
  dateOfBirth: 'Date of birth',
  anniversaryDate: 'Anniversary',
  whatsappOptIn: 'WhatsApp opt-in',
}

export type MergeConflict = {
  field: MergeConflictField
  primaryValue: string
  secondaryValue: string
}

const display = (field: MergeConflictField, value: unknown): string => {
  if (field === 'whatsappOptIn') return value ? 'Opted in' : 'Not opted in'
  if (field === 'dateOfBirth' || field === 'anniversaryDate') return formatCalendarDate(value as string)
  return String(value)
}

export function mergeConflicts(primary: Customer, secondary: Customer): MergeConflict[] {
  const conflicts: MergeConflict[] = []
  const check = (field: MergeConflictField, equal: (a: unknown, b: unknown) => boolean = (a, b) => a === b) => {
    const a = primary[field]
    const b = secondary[field]
    if (a === null || b === null || equal(a, b)) return
    conflicts.push({ field, primaryValue: display(field, a), secondaryValue: display(field, b) })
  }
  check('name', (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase())
  check('phone', (a, b) => phoneKey(String(a)) === phoneKey(String(b)))
  check('dateOfBirth')
  check('anniversaryDate')
  check('whatsappOptIn')
  return conflicts
}

export type MergeChoices = Partial<Record<MergeConflictField, 'primary' | 'secondary'>>

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]
const earliest = (a: string | null, b: string | null) => (!a ? b : !b ? a : a < b ? a : b)
const latest = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b)

/**
 * The record kept after merging. History adds up (orders, spend,
 * points, visits span both), lists are combined, blanks are filled from
 * the other record, and every conflicting field uses the chosen side.
 * Throws if a conflict has no choice.
 */
export function combineCustomers(primary: Customer, secondary: Customer, choices: MergeChoices): Customer {
  const conflicts = mergeConflicts(primary, secondary)
  const missing = conflicts.filter((c) => !choices[c.field])
  if (missing.length > 0) {
    throw new Error(`Choose which value to keep for: ${missing.map((c) => MERGE_FIELD_LABELS[c.field]).join(', ')}.`)
  }
  const pick = <K extends MergeConflictField>(field: K): Customer[K] => {
    if (choices[field] === 'secondary') return secondary[field]
    return primary[field] ?? secondary[field]
  }
  const points =
    primary.loyaltyPoints === null && secondary.loyaltyPoints === null
      ? null
      : (primary.loyaltyPoints ?? 0) + (secondary.loyaltyPoints ?? 0)
  return {
    ...primary,
    name: pick('name'),
    phone: pick('phone'),
    dateOfBirth: pick('dateOfBirth'),
    anniversaryDate: pick('anniversaryDate'),
    whatsappOptIn: pick('whatsappOptIn'),
    firstVisitAt: earliest(primary.firstVisitAt, secondary.firstVisitAt),
    lastOrderAt: latest(primary.lastOrderAt, secondary.lastOrderAt),
    orderCount: primary.orderCount + secondary.orderCount,
    lifetimeSpend: primary.lifetimeSpend + secondary.lifetimeSpend,
    loyaltyPoints: points,
    preferredOutlets: union(primary.preferredOutlets, secondary.preferredOutlets),
    preferenceTags: union(primary.preferenceTags, secondary.preferenceTags),
    activePrograms: union(primary.activePrograms, secondary.activePrograms),
    segments: [...new Set([...primary.segments, ...secondary.segments])],
    alert: primary.alert ?? secondary.alert,
  }
}
