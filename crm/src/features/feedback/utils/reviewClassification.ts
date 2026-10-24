/**
 * Book 3 §9 Review Engine business rule, implemented exactly as
 * specified — not a reinterpretation:
 * "Rating ≥4 → prompt to post publicly (Google/Zomato/etc.).
 *  Rating ≤3 → captured privately, instant alert to outlet manager,
 *  never pushed publicly."
 *
 * This is the classification rule only — it does not send anything,
 * post anywhere, or alert anyone. See services/feedbackService.ts for
 * where it's applied, and the Phase B completion report for what is
 * and isn't connected to anything real.
 */

export type ReviewRoute = 'public_prompt' | 'private_alert'

export function classifyFeedbackRating(rating: number): ReviewRoute {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.')
  }
  return rating >= 4 ? 'public_prompt' : 'private_alert'
}
