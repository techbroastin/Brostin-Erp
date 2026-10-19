import type {
  PosConnection,
  PosConnectionStatus,
  PosSyncLogEntry,
} from '@/features/pos-integrations/types/posIntegration'

/**
 * POS Integrations mock data — the single feature-local mock source,
 * per docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/pos-integrations/services/posIntegrationsService.ts
 * may import this file.
 *
 * Mutable in memory, same discipline as automation.mock.ts/
 * settings.mock.ts: connections and sync logs are session-only, lost
 * on reload. ManageMe's seeded "connected" status and sync log history
 * are simulated mock state only — no real ManageMe or Petpooja
 * connection exists anywhere in this codebase.
 *
 * Illustrative placeholders only — not real business records. See
 * DemoDataBadge wherever this data renders.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function seedConnections(): PosConnection[] {
  const now = Date.now()
  return [
    {
      id: 'pos-conn-manageme-001',
      vendor: 'manageme',
      label: 'Main Branch ManageMe',
      authMethod: 'api_key',
      status: 'connected',
      syncMode: 'polling',
      pollingIntervalMinutes: 30,
      lastSuccessfulSyncAt: new Date(now - 2 * HOUR).toISOString(),
      lastErrorMessage: null,
      createdAt: new Date(now - 10 * DAY).toISOString(),
    },
    {
      id: 'pos-conn-petpooja-001',
      vendor: 'petpooja',
      label: 'Petpooja (not yet verified)',
      authMethod: 'api_key',
      status: 'pending',
      syncMode: 'polling',
      pollingIntervalMinutes: 60,
      lastSuccessfulSyncAt: null,
      lastErrorMessage: null,
      createdAt: new Date(now - 1 * DAY).toISOString(),
    },
  ]
}

function seedSyncLogs(): PosSyncLogEntry[] {
  const now = Date.now()
  return [
    {
      id: 'pos-sync-001',
      connectionId: 'pos-conn-manageme-001',
      startedAt: new Date(now - 2 * HOUR).toISOString(),
      finishedAt: new Date(now - 2 * HOUR + 4000).toISOString(),
      entityType: 'orders',
      recordsProcessed: 18,
      recordsFailed: 0,
      status: 'success',
      errorMessage: null,
    },
    {
      id: 'pos-sync-002',
      connectionId: 'pos-conn-manageme-001',
      startedAt: new Date(now - 2.5 * HOUR).toISOString(),
      finishedAt: new Date(now - 2.5 * HOUR + 3000).toISOString(),
      entityType: 'products',
      recordsProcessed: 42,
      recordsFailed: 0,
      status: 'success',
      errorMessage: null,
    },
    {
      id: 'pos-sync-003',
      connectionId: 'pos-conn-manageme-001',
      startedAt: new Date(now - 3 * HOUR).toISOString(),
      finishedAt: new Date(now - 3 * HOUR + 5000).toISOString(),
      entityType: 'customers',
      recordsProcessed: 11,
      recordsFailed: 2,
      status: 'partial',
      errorMessage: '2 records skipped — missing phone number (mock scenario).',
    },
  ]
}

/** Mutable in-session store — see file header. */
let connectionStore: PosConnection[] = seedConnections()
let syncLogStore: PosSyncLogEntry[] = seedSyncLogs()

export function getConnectionsStore(): PosConnection[] {
  return connectionStore
}

export function getConnectionByIdFromStore(id: string): PosConnection | null {
  return connectionStore.find((c) => c.id === id) ?? null
}

export function addConnectionToStore(connection: PosConnection): void {
  connectionStore = [...connectionStore, connection]
}

export function updateConnectionInStore(
  id: string,
  patch: Partial<Pick<PosConnection, 'status' | 'lastSuccessfulSyncAt' | 'lastErrorMessage'>>,
): PosConnection | null {
  let updated: PosConnection | null = null
  connectionStore = connectionStore.map((c) => {
    if (c.id !== id) return c
    updated = { ...c, ...patch }
    return updated
  })
  return updated
}

export function setConnectionStatusInStore(id: string, status: PosConnectionStatus): PosConnection | null {
  return updateConnectionInStore(id, { status })
}

export function getSyncLogsForConnectionFromStore(connectionId: string): PosSyncLogEntry[] {
  return syncLogStore
    .filter((entry) => entry.connectionId === connectionId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export const emptyConnections: PosConnection[] = []

/**
 * Not a data scenario — a sentinel posIntegrationsService checks for
 * to throw a simulated failure, exercising PosIntegrationsErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type PosIntegrationsMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
