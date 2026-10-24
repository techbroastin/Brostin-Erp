import type { Customer, CustomerSegment } from '@/features/customers/types/customer'

/**
 * Customers mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Three scenarios: normal, empty,
 * error. Only src/features/customers/services/customerService.ts may
 * import this file (tests may read `normalCustomers`, the seed).
 *
 * MUTABLE in memory since the Book 3 §1 tools (archive, merge, bulk
 * import) change records: changes live only for this browser session.
 * Two seeded duplicates (same phone, different formatting and details)
 * give the Merge Tool something real to work on.
 *
 * Illustrative placeholders only — not real customer records, not final
 * business definitions. See DemoDataBadge wherever this data renders.
 */

const NAMES = [
  'Arjun Menon',
  'Divya Pillai',
  'Mohammed Rafiq',
  'Fathima Noor',
  'Sreekutty S',
  'Rahul Varma',
  'Anjali Nair',
  'Vishnu Prasad',
  'Meera Krishnan',
  'Suhail Ahmed',
  'Lakshmi Priya',
  'Nikhil Thomas',
  'Ayesha Beevi',
  'Kiran Kumar',
  'Devika Suresh',
  'Jithin Joseph',
  'Sana Hassan',
  'Ravi Shankar',
  'Parvathy Mohan',
  'Abdul Kareem',
  'Nandini Raj',
  'Sachin Babu',
  'Reshma Latheef',
  'Vineeth Chandran',
  'Haritha Vijayan',
]

const DAY_MS = 24 * 60 * 60 * 1000

const PREFERENCE_TAGS = ['Spicy', 'Mild', 'No mayo', 'Extra cheese', 'Family packs']

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Placeholder segment assignment, internally consistent with each mock
 * customer's own orderCount/lastOrderAt — NOT the Segmentation Engine.
 * Lapsed uses Book 3 §10's "no visit in 21-30 days" example; the other
 * thresholds are illustrative only.
 */
function placeholderSegments(orderCount: number, daysSinceLastOrder: number | null): CustomerSegment[] {
  if (orderCount === 0 || daysSinceLastOrder === null) return []
  const segments: CustomerSegment[] = [orderCount === 1 ? 'new' : orderCount >= 6 ? 'vip' : 'repeat']
  if (daysSinceLastOrder >= 21) segments.push('lapsed')
  else if (daysSinceLastOrder >= 14) segments.push('at_risk')
  return segments
}

function buildCustomers(): Customer[] {
  return NAMES.map((name, index) => {
    const hasOrders = index % 5 !== 4 // every 5th customer has never ordered
    const daysAgo = (index % 10) * 3 + 1
    const orderCount = hasOrders ? (index % 12) + 1 : 0
    const loyaltyPoints = index % 3 === 0 ? (index % 12) * 40 : null
    const tagCount = index % 3
    return {
      id: `cust-${String(index + 1).padStart(3, '0')}`,
      name,
      phone: `+91 9${String(700000000 + index * 137).slice(0, 9)}`,
      dateOfBirth:
        index % 4 !== 3 ? `${1985 + (index % 15)}-${pad2((index % 12) + 1)}-${pad2(((index * 7) % 28) + 1)}` : null,
      anniversaryDate:
        index % 3 === 1 ? `${2010 + (index % 12)}-${pad2(((index + 5) % 12) + 1)}-${pad2(((index * 5) % 28) + 1)}` : null,
      firstVisitAt: hasOrders ? new Date(Date.now() - (daysAgo + orderCount * 20) * DAY_MS).toISOString() : null,
      lastOrderAt: hasOrders ? new Date(Date.now() - daysAgo * DAY_MS).toISOString() : null,
      orderCount,
      lifetimeSpend: orderCount * (350 + (index % 4) * 90),
      preferredOutlets: hasOrders ? ['Main Branch'] : [],
      preferenceTags: Array.from({ length: tagCount }, (_, i) => PREFERENCE_TAGS[(index + i) % PREFERENCE_TAGS.length]),
      whatsappOptIn: index % 4 !== 2,
      segments: placeholderSegments(orderCount, hasOrders ? daysAgo : null),
      activePrograms: loyaltyPoints !== null ? ['Loyalty'] : [],
      loyaltyPoints,
      alert: index % 7 === 0 ? 'Feedback awaiting response' : null,
      archivedAt: null,
      archiveReason: null,
      mergedIntoId: null,
    }
  })
}

/**
 * Accidental second records, as created by a typo'd or re-entered phone:
 * same number in a different format, with conflicting details that the
 * Merge Tool must ask about (name, date of birth, WhatsApp consent).
 */
function buildDuplicates(base: Customer[]): Customer[] {
  const lakshmi = base[10]
  const rafiq = base[2]
  const daysAgo = (d: number) => new Date(Date.now() - d * DAY_MS).toISOString()
  return [
    {
      ...lakshmi,
      id: 'cust-026',
      name: 'Lakshmi P',
      phone: lakshmi.phone.replace(/^\+91\s?/, ''),
      dateOfBirth: '1990-04-12',
      anniversaryDate: null,
      firstVisitAt: daysAgo(300),
      lastOrderAt: daysAgo(25),
      orderCount: 2,
      lifetimeSpend: 780,
      preferenceTags: ['Spicy'],
      segments: placeholderSegments(2, 25),
      activePrograms: [],
      loyaltyPoints: null,
      alert: null,
    },
    {
      ...rafiq,
      id: 'cust-027',
      name: 'Mohd Rafiq',
      phone: rafiq.phone.replace(/^\+91\s?(\d{5})(\d{5})$/, '+91-$1-$2'),
      dateOfBirth: null,
      whatsappOptIn: !rafiq.whatsappOptIn,
      firstVisitAt: daysAgo(120),
      lastOrderAt: daysAgo(18),
      orderCount: 1,
      lifetimeSpend: 420,
      preferenceTags: ['Family packs'],
      segments: placeholderSegments(1, 18),
      activePrograms: [],
      loyaltyPoints: null,
      alert: null,
    },
  ]
}

const seedBase = buildCustomers()

/** The seed records (read-only reference for tests). */
export const normalCustomers: Customer[] = [...seedBase, ...buildDuplicates(seedBase)]

let customerStore: Customer[] = [...normalCustomers]

export function getCustomerStore(): Customer[] {
  return customerStore
}

export function addCustomersToStore(customers: Customer[]): void {
  customerStore = [...customerStore, ...customers]
}

export function replaceCustomerInStore(customer: Customer): void {
  customerStore = customerStore.map((c) => (c.id === customer.id ? customer : c))
}

export const emptyCustomers: Customer[] = []

/**
 * Not a data scenario — a sentinel customerService checks for to throw a
 * simulated failure, exercising CustomerErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type CustomerMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
