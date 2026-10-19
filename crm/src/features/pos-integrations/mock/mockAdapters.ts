import type { PosAdapter } from '@/features/pos-integrations/types/posAdapter'

const SIMULATED_LATENCY_MS = 700

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

/**
 * Mock adapters — stand in for real ManageMe/Petpooja adapters until
 * verified vendor API documentation exists (docs/FRONTEND_ARCHITECTURE.md
 * §28, docs/NAVIGATION.md §18: "do not invent integration settings
 * before the integration is defined"). testConnection deliberately
 * returns a deterministic outcome per vendor, demonstrating both the
 * success and failure UI states without flaky/random behavior:
 * ManageMe always succeeds, Petpooja always fails until a real,
 * documented Petpooja integration is approved and built.
 *
 * fetchOrders is never called by any screen — it exists only to
 * satisfy the PosAdapter contract and is explicitly unimplemented.
 */

const managemeAdapter: PosAdapter = {
  vendor: 'manageme',
  async testConnection() {
    await delay()
    return { ok: true, message: 'Connected successfully (mock — no real ManageMe API call was made).' }
  },
  async fetchOrders() {
    throw new Error('Not implemented — no verified ManageMe API documentation exists yet.')
  },
}

const petpoojaAdapter: PosAdapter = {
  vendor: 'petpooja',
  async testConnection() {
    await delay()
    return {
      ok: false,
      message: 'Could not verify credentials (mock failure — no real Petpooja integration exists yet).',
    }
  },
  async fetchOrders() {
    throw new Error('Not implemented — no verified Petpooja API documentation exists yet.')
  },
}

const ADAPTERS: Record<PosAdapter['vendor'], PosAdapter> = {
  manageme: managemeAdapter,
  petpooja: petpoojaAdapter,
}

export function getMockAdapter(vendor: PosAdapter['vendor']): PosAdapter {
  return ADAPTERS[vendor]
}
