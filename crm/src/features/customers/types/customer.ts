/**
 * Customers feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * id/name/phone map to the existing public.customers Supabase columns.
 * lastOrderAt/orderCount/loyaltyPoints/alert have NO current backend
 * representation (no order-aggregation view, no loyalty tables exist yet)
 * — mock-only until a real data source is built.
 */

export type Customer = {
  id: string
  name: string
  phone: string
  lastOrderAt: string | null
  orderCount: number
  loyaltyPoints: number | null
  alert: string | null
}

export type CustomerSortBy = 'name' | 'lastOrderAt'

export type CustomerListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: CustomerSortBy
}

export type CustomerListResult = {
  items: Customer[]
  total: number
}
