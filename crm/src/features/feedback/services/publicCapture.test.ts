import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Covers the Phase C public-capture contract at the service layer
 * (the same functions PublicFeedbackCaptureContent.tsx calls):
 * getFeedbackByOrderId (pre-check) and submitFeedbackRating's two
 * routing branches, reusing Phase B's classification rule exactly.
 */
describe('public feedback capture (service layer)', () => {
  let service: typeof import('./feedbackService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./feedbackService')
  })

  test('getFeedbackByOrderId returns null when no feedback exists yet for the order', async () => {
    expect(await service.getFeedbackByOrderId('ord-002')).toBeNull()
  })

  test('getFeedbackByOrderId finds a submitted rating by order id', async () => {
    const created = await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 4 })
    const found = await service.getFeedbackByOrderId('ord-002')

    expect(found?.id).toBe(created.id)
  })

  test('rating 1-3 submission routes private (needs attention, no public prompt)', async () => {
    const created = await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 1 })
    expect(service.isFeedbackNeedsAttention(created)).toBe(true)
  })

  test('rating 4-5 submission routes public (no attention flag)', async () => {
    const created = await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 5 })
    expect(service.isFeedbackNeedsAttention(created)).toBe(false)
  })

  test('a second submission for the same order is rejected (one rating per visit)', async () => {
    await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 5 })
    await expect(
      service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 1 }),
    ).rejects.toThrow('has already been rated')
  })

  test('an optional message is trimmed and stored verbatim', async () => {
    const created = await service.submitFeedbackRating({
      customerId: 'cust-002',
      orderId: 'ord-002',
      rating: 2,
      message: '  Food was cold.  ',
    })
    expect(created.message).toBe('Food was cold.')
  })

  test('submitting with no message falls back to a non-empty placeholder, never blank', async () => {
    const created = await service.submitFeedbackRating({ customerId: 'cust-002', orderId: 'ord-002', rating: 5 })
    expect(created.message.length).toBeGreaterThan(0)
  })
})
