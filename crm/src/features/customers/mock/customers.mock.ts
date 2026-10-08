import type { Customer } from '@/features/customers/types/customer'

/**
 * Customers mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Three scenarios: normal, empty,
 * error. Only src/features/customers/services/customerService.ts may
 * import this file.
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

function buildCustomers(): Customer[] {
  return NAMES.map((name, index) => {
    const hasOrders = index % 5 !== 4 // every 5th customer has never ordered
    const daysAgo = (index % 10) * 3 + 1
    return {
      id: `cust-${String(index + 1).padStart(3, '0')}`,
      name,
      phone: `+91 9${String(700000000 + index * 137).slice(0, 9)}`,
      lastOrderAt: hasOrders
        ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
        : null,
      orderCount: hasOrders ? (index % 12) + 1 : 0,
      loyaltyPoints: index % 3 === 0 ? (index % 12) * 40 : null,
      alert: index % 7 === 0 ? 'Feedback awaiting response' : null,
    }
  })
}

export const normalCustomers: Customer[] = buildCustomers()

export const emptyCustomers: Customer[] = []

/**
 * Not a data scenario — a sentinel customerService checks for to throw a
 * simulated failure, exercising CustomerErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type CustomerMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
