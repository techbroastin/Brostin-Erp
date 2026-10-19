import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no real POS API, no Supabase, no network,
 * no credentials. Each test gets a freshly re-imported module graph
 * (vi.resetModules()) so the in-memory connection/sync-log store from
 * posIntegrations.mock.ts starts from its seed state every time,
 * matching the service's own "session-only" mock contract rather than
 * leaking mutations between tests.
 */
describe('posIntegrationsService', () => {
  let service: typeof import('./posIntegrationsService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./posIntegrationsService')
  })

  test('listPosConnections returns the seeded ManageMe and Petpooja connections', async () => {
    const connections = await service.listPosConnections()
    expect(connections.map((c) => c.id)).toEqual(['pos-conn-manageme-001', 'pos-conn-petpooja-001'])
  })

  test('listPosConnections returns an empty array for the empty scenario', async () => {
    expect(await service.listPosConnections('empty')).toEqual([])
  })

  test('listPosConnections throws for the error scenario', async () => {
    await expect(service.listPosConnections('error')).rejects.toThrow('Failed to load POS connections.')
  })

  test('getPosConnectionById returns null for an unknown id', async () => {
    expect(await service.getPosConnectionById('does-not-exist')).toBeNull()
  })

  test('addPosConnection creates a pending connection that appears in the list', async () => {
    const created = await service.addPosConnection({
      vendor: 'manageme',
      label: 'Second Branch ManageMe',
      authMethod: 'api_key',
      syncMode: 'polling',
      pollingIntervalMinutes: 15,
    })

    expect(created.status).toBe('pending')
    expect(created.lastSuccessfulSyncAt).toBeNull()
    expect(created.lastErrorMessage).toBeNull()

    const connections = await service.listPosConnections()
    expect(connections).toHaveLength(3)
    expect(connections.find((c) => c.id === created.id)).toBeDefined()
  })

  test('addPosConnection nulls pollingIntervalMinutes when syncMode is webhook', async () => {
    const created = await service.addPosConnection({
      vendor: 'petpooja',
      label: 'Webhook test connection',
      authMethod: 'oauth2',
      syncMode: 'webhook',
      pollingIntervalMinutes: 20,
    })

    expect(created.pollingIntervalMinutes).toBeNull()
  })

  test('testPosConnection marks a ManageMe connection connected (mock adapter always succeeds)', async () => {
    const connection = await service.getPosConnectionById('pos-conn-manageme-001')
    const result = await service.testPosConnection(connection!)

    expect(result.ok).toBe(true)

    const updated = await service.getPosConnectionById('pos-conn-manageme-001')
    expect(updated?.status).toBe('connected')
    expect(updated?.lastErrorMessage).toBeNull()
    expect(updated?.lastSuccessfulSyncAt).not.toBeNull()
  })

  test('testPosConnection marks a Petpooja connection as error (mock adapter always fails)', async () => {
    const connection = await service.getPosConnectionById('pos-conn-petpooja-001')
    const result = await service.testPosConnection(connection!)

    expect(result.ok).toBe(false)

    const updated = await service.getPosConnectionById('pos-conn-petpooja-001')
    expect(updated?.status).toBe('error')
    expect(updated?.lastErrorMessage).toBe(result.message)
  })

  test('setPosConnectionDisabled disables, then reconnects a connection to pending', async () => {
    const disabled = await service.setPosConnectionDisabled('pos-conn-manageme-001', true)
    expect(disabled?.status).toBe('disabled')

    const reconnected = await service.setPosConnectionDisabled('pos-conn-manageme-001', false)
    expect(reconnected?.status).toBe('pending')
  })

  test('setPosConnectionDisabled returns null for an unknown connection id', async () => {
    expect(await service.setPosConnectionDisabled('does-not-exist', true)).toBeNull()
  })

  test('getPosSyncLogs returns the seeded ManageMe logs sorted newest-first', async () => {
    const logs = await service.getPosSyncLogs('pos-conn-manageme-001')

    expect(logs.map((l) => l.id)).toEqual(['pos-sync-001', 'pos-sync-002', 'pos-sync-003'])
    const timestamps = logs.map((l) => new Date(l.startedAt).getTime())
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
  })

  test('getPosSyncLogs returns an empty array for a connection with no logged syncs', async () => {
    expect(await service.getPosSyncLogs('pos-conn-petpooja-001')).toEqual([])
  })
})
