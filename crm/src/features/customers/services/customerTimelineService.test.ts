import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no real backend, no network. Each test
 * re-imports the module graph (vi.resetModules()) so the in-memory
 * native-event store (customerTimeline.mock.ts) starts from its seed
 * state every time, matching this feature's session-only mock
 * contract rather than leaking mutations between tests.
 */
describe('customerTimelineService', () => {
  let service: typeof import('./customerTimelineService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./customerTimelineService')
  })

  test('returns a chronologically sorted (newest-first) timeline for a customer with real data', async () => {
    const events = await service.getCustomerTimeline('cust-001')

    expect(events.length).toBeGreaterThan(0)
    const timestamps = events.map((e) => new Date(e.occurredAt).getTime())
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
  })

  test('aggregates visit, points and note events from real order/loyalty/native data for cust-001', async () => {
    const events = await service.getCustomerTimeline('cust-001')
    const types = new Set(events.map((e) => e.type))

    expect(types.has('visit')).toBe(true)
    expect(types.has('points')).toBe(true)
    expect(types.has('note')).toBe(true)

    const visitEvent = events.find((e) => e.type === 'visit')
    expect(visitEvent?.href).toBe('/orders/ord-001')
  })

  test('never produces message events (no real per-customer send-log exists)', async () => {
    const events = await service.getCustomerTimeline('cust-001')
    expect(events.some((e) => e.type === 'message')).toBe(false)
  })

  test('returns an empty array for a customer with no matching records', async () => {
    const events = await service.getCustomerTimeline('cust-does-not-exist')
    expect(events).toEqual([])
  })

  test('returns an empty array for the empty scenario', async () => {
    expect(await service.getCustomerTimeline('cust-001', 'empty')).toEqual([])
  })

  test('throws for the error scenario', async () => {
    await expect(service.getCustomerTimeline('cust-001', 'error')).rejects.toThrow(
      'Failed to load customer timeline.',
    )
  })

  test('addCustomerTimelineNote appends a new event without altering existing ones (append-only)', async () => {
    const before = await service.getCustomerTimeline('cust-001')
    const beforeIds = before.map((e) => e.id)

    const created = await service.addCustomerTimelineNote({
      customerId: 'cust-001',
      title: 'Manual note',
      detail: 'Added during a test.',
    })

    const after = await service.getCustomerTimeline('cust-001')

    expect(after).toHaveLength(before.length + 1)
    expect(after.map((e) => e.id)).toEqual(expect.arrayContaining(beforeIds))
    expect(after.find((e) => e.id === created.id)).toBeDefined()
    expect(created.type).toBe('note')
    expect(created.correctsEventId).toBeNull()
  })

  test('a correction supersedes but never removes or mutates the original event', async () => {
    const before = await service.getCustomerTimeline('cust-001')
    const original = before.find((e) => e.id === 'tl-native-001')
    expect(original).toBeDefined()
    const originalSnapshot = { ...original! }

    const correction = await service.addCustomerTimelineNote({
      customerId: 'cust-001',
      title: 'Test correction',
      detail: 'Supersedes the original balance note.',
      correctsEventId: 'tl-native-001',
    })

    const after = await service.getCustomerTimeline('cust-001')
    const originalAfter = after.find((e) => e.id === 'tl-native-001')
    const correctionAfter = after.find((e) => e.id === correction.id)

    // Original is still present and byte-identical — never edited or removed.
    expect(originalAfter).toEqual(originalSnapshot)
    // The correction is a new, separate event referencing the original.
    expect(correctionAfter?.correctsEventId).toBe('tl-native-001')
    expect(after.length).toBe(before.length + 1)
  })

  test('seeded correction pair for cust-001 is both present (append-only history preserved)', async () => {
    const events = await service.getCustomerTimeline('cust-001')
    const original = events.find((e) => e.id === 'tl-native-001')
    const correction = events.find((e) => e.id === 'tl-native-002')

    expect(original).toBeDefined()
    expect(correction).toBeDefined()
    expect(correction?.correctsEventId).toBe('tl-native-001')
  })
})
