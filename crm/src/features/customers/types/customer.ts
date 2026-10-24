/**
 * Customers feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * id/name/phone map to the existing public.customers Supabase columns.
 * Every other field has NO current backend representation (no
 * order-aggregation view, no loyalty/segment/program tables exist yet)
 * — mock-only until a real data source is built.
 *
 * Book 3 §1 (CRM Engine) stored-field list, mapped onto this model:
 * - last-visit date        → lastOrderAt (a visit is an order until a
 *                             separate visit concept exists)
 * - lifetime visit count   → orderCount (same reasoning)
 * - segment tag(s)         → segments — placeholder values until the
 *                             Segmentation Engine (Book 3 §10) computes them
 * - current active Programs → activePrograms — placeholder until the
 *                             Program Engine (Book 3 §2) exists
 */

/** Book 3 §10's pre-built segment set. */
export type CustomerSegment = 'new' | 'repeat' | 'vip' | 'lapsed' | 'at_risk'

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  new: 'New',
  repeat: 'Repeat',
  vip: 'Loyal / VIP',
  lapsed: 'Lapsed',
  at_risk: 'At risk',
}

export type Customer = {
  id: string
  name: string
  phone: string
  /** Calendar date, YYYY-MM-DD. */
  dateOfBirth: string | null
  /** Calendar date, YYYY-MM-DD. */
  anniversaryDate: string | null
  /** ISO timestamp of the first recorded visit. */
  firstVisitAt: string | null
  lastOrderAt: string | null
  orderCount: number
  /** Lifetime spend in whole rupees. */
  lifetimeSpend: number
  preferredOutlets: string[]
  /** Dietary/preference tags, e.g. "Spicy", "No mayo". */
  preferenceTags: string[]
  whatsappOptIn: boolean
  segments: CustomerSegment[]
  activePrograms: string[]
  loyaltyPoints: number | null
  alert: string | null
  /**
   * Book 3 §1: customers are never deleted, only archived. Archived
   * customers are hidden from lists, segments and campaigns.
   */
  archivedAt: string | null
  archiveReason: string | null
  /** Set when this record was merged into another customer (Merge Tool). */
  mergedIntoId: string | null
}

export type CustomerSortBy = 'name' | 'lastOrderAt'

export type CustomerListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: CustomerSortBy
  /** Archived customers are left out unless this is true. */
  includeArchived?: boolean
}

export type CustomerListResult = {
  items: Customer[]
  total: number
}
