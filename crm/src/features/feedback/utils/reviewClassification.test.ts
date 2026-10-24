import { describe, expect, test } from 'vitest'
import { classifyFeedbackRating } from './reviewClassification'

describe('classifyFeedbackRating', () => {
  test.each([4, 5])('rating %i classifies as public_prompt', (rating) => {
    expect(classifyFeedbackRating(rating)).toBe('public_prompt')
  })

  test.each([1, 2, 3])('rating %i classifies as private_alert', (rating) => {
    expect(classifyFeedbackRating(rating)).toBe('private_alert')
  })

  test.each([0, 6, -1, 2.5, NaN])('rejects invalid rating %s', (rating) => {
    expect(() => classifyFeedbackRating(rating)).toThrow('Rating must be an integer between 1 and 5.')
  })
})
