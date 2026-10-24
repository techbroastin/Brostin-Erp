import type { MessageChannel } from '@/features/settings/types/settings'

/**
 * Program Engine types — Book 3 §2, MVP: loyalty programs only (other
 * program kinds and the Marketplace are Phase 2+). A program bundles an
 * eligibility rule, a trigger, a reward and a message. The earning rules
 * themselves are configured by the owner in the builder — none is
 * hard-coded here; the seed programs are illustrative.
 */

export type ProgramStatus = 'draft' | 'active' | 'paused' | 'archived'

export type ProgramTrigger = 'order_placed' | 'every_nth_visit' | 'birthday'

export type ProgramReward =
  /** `points` per ₹100 of the order value. */
  | { type: 'points_per_spend'; points: number }
  | { type: 'fixed_points'; points: number }
  /** An item from the Loyalty rewards catalogue. */
  | { type: 'catalogue_reward'; rewardId: string }

/**
 * Book 2 §4 / Book 3 §2: every reward must name who pays for it before
 * the program can go live — a hard gate, not a warning.
 */
export type CostOwner = 'brand' | 'outlet'

export type ProgramMessage = {
  body: string
  channel: MessageChannel
  /** Same Book 3 §3 rule as workflows: required before going live. */
  fallback: MessageChannel | 'log_only' | null
}

export type Program = {
  id: string
  name: string
  description: string
  status: ProgramStatus
  /** Null = every (non-archived) customer is eligible. */
  segmentId: string | null
  trigger: ProgramTrigger
  /** Only for every_nth_visit. */
  visitInterval: number | null
  reward: ProgramReward
  message: ProgramMessage
  costOwner: CostOwner | null
  /**
   * Programs this one can't be combined with on the same visit (Book 3
   * §2: a per-program setting, not a global rule). Symmetric — saving
   * one side updates the other.
   */
  exclusiveWith: string[]
  createdAt: string
  updatedAt: string
}

export type ProgramSummary = Program & {
  segmentName: string | null
  rewardName: string | null
}

export type ProgramInput = Omit<Program, 'id' | 'status' | 'createdAt' | 'updatedAt'>

/** One simulated visit, for "Try a visit". */
export type ProgramEvent = {
  customerId: string
  orderValue: number
  /** The customer's visit number on this visit, for every_nth_visit. */
  visitNumber: number
  isBirthday: boolean
}

export type ProgramOutcome = {
  programId: string
  programName: string
  result: 'applies' | 'not_eligible' | 'not_triggered' | 'excluded'
  detail: string
}

export const STATUS_LABELS: Record<ProgramStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
}

export const TRIGGER_LABELS: Record<ProgramTrigger, string> = {
  order_placed: 'Every order',
  every_nth_visit: 'Every Nth visit',
  birthday: 'Birthday visit',
}

export const COST_OWNER_LABELS: Record<CostOwner, string> = {
  brand: 'Brand-funded (Broastin)',
  outlet: 'Outlet-funded (franchisee)',
}

/** Book 3 §2 Program Detail results, from the loyalty points ledger. */
export type ProgramPerformance = {
  timesApplied: number
  customersRewarded: number
  pointsAwarded: number
  lastAppliedAt: string | null
}
