import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no real backend, no network, no credentials.
 * Each test re-imports the module graph (vi.resetModules()) so the
 * in-memory feedback store starts from its seed state every time.
 *
 * ord-002 belongs to cust-002 in orders.mock.ts's deterministic seed
 * (customerIndicesWithOrders[1] === 1 → customerIdFor(1) === 'cust-002').
 */
describe('feedbackService', () => {
  let service: typeof import('./feedbackService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./feedbackService')
  })

  test('submitFeedbackRating classifies rating 4-5 as public_prompt-eligible (not needing attention)', async () => {
    const created = await service.submitFeedbackRating({
      customerId: 'cust-002',
      orderId: 'ord-002',
      rating: 5,
      message: 'Loved it!',
    })

    expect(created.rating).toBe(5)
    expect(created.sentiment).toBe('positive')
    expect(service.isFeedbackNeedsAttention(created)).toBe(false)
  })

  test('submitFeedbackRating classifies rating 1-3 as private_alert / needing attention', async () => {
    const created = await service.submitFeedbackRating({
      customerId: 'cust-002',
      orderId: 'ord-002',
      rating: 2,
    })

    expect(created.rating).toBe(2)
    expect(created.sentiment).toBe('negative')
    expect(created.status).toBe('open')
    expect(service.isFeedbackNeedsAttention(created)).toBe(true)
  })

  test('rejects an invalid rating', async () => {
    await expect(
      service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 7 }),
    ).rejects.toThrow('Rating must be an integer between 1 and 5.')
  })

  test('rejects an unknown customer', async () => {
    await expect(
      service.submitFeedbackRating({ customerId: 'cust-does-not-exist', orderId: 'ord-002', rating: 4 }),
    ).rejects.toThrow('Unknown customer')
  })

  test('rejects an unknown order', async () => {
    await expect(
      service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-does-not-exist', rating: 4 }),
    ).rejects.toThrow('Unknown order')
  })

  test('rejects an order that does not belong to the given customer', async () => {
    // ord-002 belongs to cust-002, not cust-010.
    await expect(
      service.submitFeedbackRating({ customerId: 'cust-010', orderId: 'ord-002', rating: 4 }),
    ).rejects.toThrow('does not belong to customer')
  })

  test('rejects a duplicate submission for the same order', async () => {
    await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 4 })

    await expect(
      service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 5 }),
    ).rejects.toThrow('has already been rated')
  })

  test('a new submission appears in listFeedback without altering existing seeded entries', async () => {
    const before = await service.listFeedback({ search: '', sentiment: 'all', page: 1, pageSize: 1000 })

    await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 2 })

    const after = await service.listFeedback({ search: '', sentiment: 'all', page: 1, pageSize: 1000 })

    expect(after.total).toBe(before.total + 1)
    expect(before.items.every((b) => after.items.some((a) => a.id === b.id))).toBe(true)
  })

  test('listFeedback sorts items needing attention before any that do not', async () => {
    await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 2 })

    const { items } = await service.listFeedback({ search: '', sentiment: 'all', page: 1, pageSize: 1000 })
    const priorityFlags = items.map((item) => service.isFeedbackNeedsAttention(item))

    // Once a non-priority item appears, no priority item should appear after it
    // — i.e. the flags are monotonically non-increasing (true*, then false*).
    let seenNonPriority = false
    for (const isPriority of priorityFlags) {
      if (!isPriority) seenNonPriority = true
      if (isPriority && seenNonPriority) {
        throw new Error('Found a priority item after a non-priority item — sort order violated.')
      }
    }
    expect(priorityFlags.some(Boolean)).toBe(true)
  })

  test('throws for the error scenario', async () => {
    await expect(
      service.listFeedback({ search: '', sentiment: 'all', page: 1, pageSize: 10 }, 'error'),
    ).rejects.toThrow('Failed to load feedback.')
  })
})
