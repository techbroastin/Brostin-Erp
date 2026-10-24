import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no backend, no network. vi.resetModules()
 * gives every test a fresh in-memory segment store.
 */
describe('segmentService', () => {
  let service: typeof import('./segmentService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./segmentService')
  })

  test('lists pre-built segments before custom ones', async () => {
    const segments = await service.listSegments()
    const kinds = segments.map((s) => s.kind)
    expect(kinds.indexOf('custom')).toBeGreaterThan(kinds.lastIndexOf('prebuilt'))
    expect(segments.filter((s) => s.kind === 'prebuilt')).toHaveLength(5)
  })

  test("pre-built membership agrees with the customers' placeholder segment tags", async () => {
    const { listCustomers } = await import('@/features/customers/services/customerService')
    const { items: customers } = await listCustomers({ search: '', page: 1, pageSize: 1000, sortBy: 'name' })
    const pairs = [
      ['seg-new', 'new'],
      ['seg-repeat', 'repeat'],
      ['seg-vip', 'vip'],
      ['seg-lapsed', 'lapsed'],
      ['seg-at-risk', 'at_risk'],
    ] as const

    for (const [segmentId, tag] of pairs) {
      const detail = await service.getSegmentDetail(segmentId)
      const expected = customers.filter((c) => c.segments.includes(tag)).map((c) => c.id)
      expect(detail?.members.map((c) => c.id), segmentId).toEqual(expected)
    }
  })

  test('createSegment stores a custom segment pending its first nightly run', async () => {
    const created = await service.createSegment({
      name: 'Regulars',
      description: '',
      match: 'all',
      rules: [{ field: 'order_count', operator: 'gte', value: '3' }],
    })
    expect(created.kind).toBe('custom')
    expect(created.lastCalculatedAt).toBeNull()

    const segments = await service.listSegments()
    expect(segments.some((s) => s.id === created.id)).toBe(true)
  })

  test('rejects duplicate names case-insensitively', async () => {
    await expect(
      service.createSegment({
        name: 'loyal / vip',
        description: '',
        match: 'all',
        rules: [{ field: 'order_count', operator: 'gte', value: '1' }],
      }),
    ).rejects.toThrow('already exists')
  })

  test('pre-built segments cannot be updated or deleted', async () => {
    const input = { name: 'X', description: '', match: 'all' as const, rules: [] }
    await expect(service.updateSegment('seg-vip', input)).rejects.toThrow('cannot be changed')
    await expect(service.deleteSegment('seg-vip')).rejects.toThrow('cannot be changed')
  })

  test('custom segments can be edited and deleted', async () => {
    const updated = await service.updateSegment('seg-custom-001', {
      name: 'Big spenders',
      description: 'Edited',
      match: 'any',
      rules: [{ field: 'lifetime_spend', operator: 'gt', value: '1000' }],
    })
    expect(updated.name).toBe('Big spenders')
    expect(updated.lastCalculatedAt).toBeNull()

    await service.deleteSegment('seg-custom-001')
    expect(await service.getSegmentDetail('seg-custom-001')).toBeNull()
  })

  test('previewSegment caps the sample but reports the full count', async () => {
    const preview = await service.previewSegment({
      match: 'all',
      rules: [{ field: 'order_count', operator: 'gte', value: '0' }],
    })
    expect(preview.memberCount).toBe(preview.totalCustomers)
    expect(preview.sample.length).toBeLessThanOrEqual(8)
  })

  test('the error scenario throws', async () => {
    await expect(service.listSegments('error')).rejects.toThrow()
  })
})
