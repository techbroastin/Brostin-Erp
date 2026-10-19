/**
 * POS Integrations feature types — provisional frontend view models,
 * not the Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * docs/IMPLEMENTATION_PLAN.md §21 ("Phase 18 — ManageMe Integration
 * Boundary") names ManageMe as the only canonical initial POS
 * provider; Petpooja and the vendor-neutral multi-connection model
 * below are an approved Phase 18b extension of that boundary, not a
 * locked Broastin business rule. No real ManageMe or Petpooja API,
 * auth mechanism, or payload shape is confirmed anywhere — see
 * mock/mockAdapters.ts and types/posAdapter.ts. Everything here is an
 * illustrative mock-phase placeholder (docs/FRONTEND_ARCHITECTURE.md
 * §28: "During the mock phase, integrations/ remains unused" — real
 * adapters belong in src/integrations/, never here).
 */

export type PosVendor = 'manageme' | 'petpooja'

export const VENDOR_LABELS: Record<PosVendor, string> = {
  manageme: 'ManageMe',
  petpooja: 'Petpooja',
}

export type PosConnectionStatus = 'connected' | 'error' | 'disabled' | 'pending'

export type PosAuthMethod = 'api_key' | 'oauth2' | 'basic'

export const AUTH_METHOD_LABELS: Record<PosAuthMethod, string> = {
  api_key: 'API key',
  oauth2: 'OAuth 2.0',
  basic: 'Basic auth',
}

export type PosSyncMode = 'polling' | 'webhook'

export type PosConnection = {
  id: string
  vendor: PosVendor
  label: string
  authMethod: PosAuthMethod
  status: PosConnectionStatus
  syncMode: PosSyncMode
  /** Only meaningful when syncMode === 'polling'. */
  pollingIntervalMinutes: number | null
  lastSuccessfulSyncAt: string | null
  lastErrorMessage: string | null
  createdAt: string
}

export type PosSyncEntityType = 'orders' | 'products' | 'customers' | 'payments' | 'refunds' | 'inventory'

export const SYNC_ENTITY_LABELS: Record<PosSyncEntityType, string> = {
  orders: 'Orders',
  products: 'Products',
  customers: 'Customers',
  payments: 'Payments',
  refunds: 'Refunds',
  inventory: 'Inventory',
}

export type PosSyncLogStatus = 'success' | 'partial' | 'failed'

export type PosSyncLogEntry = {
  id: string
  connectionId: string
  startedAt: string
  finishedAt: string | null
  entityType: PosSyncEntityType
  recordsProcessed: number
  recordsFailed: number
  status: PosSyncLogStatus
  errorMessage: string | null
}

export type AddPosConnectionInput = {
  vendor: PosVendor
  label: string
  authMethod: PosAuthMethod
  syncMode: PosSyncMode
  pollingIntervalMinutes: number | null
}

/**
 * Illustrative field-mapping rows only — no real ManageMe/Petpooja
 * payload field names are confirmed anywhere. Never persisted beyond
 * the in-memory mock store; see mock/posIntegrations.mock.ts.
 */
export type PosFieldMappingRow = {
  broastinField: string
  vendorField: string
}
