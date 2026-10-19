import type {
  PosConnection,
  PosSyncLogEntry,
  AddPosConnectionInput,
} from '@/features/pos-integrations/types/posIntegration'
import type { PosTestConnectionResult } from '@/features/pos-integrations/types/posAdapter'
import {
  getConnectionsStore,
  getConnectionByIdFromStore,
  addConnectionToStore,
  updateConnectionInStore,
  setConnectionStatusInStore,
  getSyncLogsForConnectionFromStore,
  emptyConnections,
  ERROR_SCENARIO_FLAG,
  type PosIntegrationsMockScenario,
} from '@/features/pos-integrations/mock/posIntegrations.mock'
import { getMockAdapter } from '@/features/pos-integrations/mock/mockAdapters'

const SIMULATED_LATENCY_MS = 500

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

function getSourceDataset(scenario: PosIntegrationsMockScenario): PosConnection[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load POS connections.')
  }
  return scenario === 'empty' ? emptyConnections : getConnectionsStore()
}

export async function listPosConnections(
  scenario: PosIntegrationsMockScenario = 'normal',
): Promise<PosConnection[]> {
  await delay()
  return getSourceDataset(scenario)
}

export async function getPosConnectionById(id: string): Promise<PosConnection | null> {
  await delay()
  return getConnectionByIdFromStore(id)
}

export async function getPosSyncLogs(connectionId: string): Promise<PosSyncLogEntry[]> {
  await delay()
  return getSyncLogsForConnectionFromStore(connectionId)
}

/**
 * Creates a connection in the in-memory mock store only — see
 * mock/posIntegrations.mock.ts header. Not persisted to any backend,
 * lost on reload. New connections always start 'pending' — adding one
 * never establishes a real vendor connection.
 */
export async function addPosConnection(input: AddPosConnectionInput): Promise<PosConnection> {
  await delay()

  const connection: PosConnection = {
    id: `pos-conn-${input.vendor}-${Date.now()}`,
    vendor: input.vendor,
    label: input.label,
    authMethod: input.authMethod,
    status: 'pending',
    syncMode: input.syncMode,
    pollingIntervalMinutes: input.syncMode === 'polling' ? input.pollingIntervalMinutes : null,
    lastSuccessfulSyncAt: null,
    lastErrorMessage: null,
    createdAt: new Date().toISOString(),
  }

  addConnectionToStore(connection)
  return connection
}

/**
 * Runs the mock adapter's testConnection and records the outcome on
 * the in-memory connection. Never calls a real vendor API — see
 * mock/mockAdapters.ts.
 */
export async function testPosConnection(connection: PosConnection): Promise<PosTestConnectionResult> {
  const adapter = getMockAdapter(connection.vendor)
  const result = await adapter.testConnection(connection)

  updateConnectionInStore(connection.id, {
    status: result.ok ? 'connected' : 'error',
    lastSuccessfulSyncAt: result.ok ? new Date().toISOString() : connection.lastSuccessfulSyncAt,
    lastErrorMessage: result.ok ? null : result.message,
  })

  return result
}

/**
 * Toggles a connection between 'disabled' and 'pending' in the mock
 * store only. Reconnecting never re-verifies credentials by itself —
 * Test Connection must be run again.
 */
export async function setPosConnectionDisabled(id: string, disabled: boolean): Promise<PosConnection | null> {
  await delay()
  return setConnectionStatusInStore(id, disabled ? 'disabled' : 'pending')
}
