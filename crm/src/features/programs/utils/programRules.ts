import type { Customer } from '@/features/customers/types/customer'
import type { Reward } from '@/features/loyalty/types/loyalty'
import type {
  Program,
  ProgramEvent,
  ProgramOutcome,
  ProgramReward,
} from '@/features/programs/types/program'
import { TRIGGER_LABELS } from '@/features/programs/types/program'

export function describeReward(reward: ProgramReward, rewards: Reward[] = []): string {
  switch (reward.type) {
    case 'points_per_spend':
      return `${reward.points} points per ₹100 spent`
    case 'fixed_points':
      return `${reward.points} points`
    case 'catalogue_reward':
      return rewards.find((r) => r.id === reward.rewardId)?.name ?? 'A catalogue reward'
  }
}

export function describeTrigger(program: Pick<Program, 'trigger' | 'visitInterval'>): string {
  return program.trigger === 'every_nth_visit'
    ? `Every ${program.visitInterval}${ordinalSuffix(program.visitInterval ?? 0)} visit`
    : TRIGGER_LABELS[program.trigger]
}

function ordinalSuffix(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
}

/**
 * Book 3 §2 publish gate — what must be fixed before Draft → Active.
 * The cost owner is a hard requirement; so is a message fallback.
 */
export function publishProblems(program: Program, existingIds: string[]): string[] {
  const problems: string[] = []
  if (program.costOwner === null) problems.push('Choose who pays for the reward (brand or outlet).')
  if (program.message.fallback === null) {
    problems.push('Choose a message fallback (another channel, or log only).')
  } else if (program.message.fallback === program.message.channel) {
    problems.push('The message fallback must be different from its main channel.')
  }
  if (program.trigger === 'every_nth_visit' && !(program.visitInterval && program.visitInterval >= 2)) {
    problems.push('Set how many visits earn the reward (2 or more).')
  }
  if (program.exclusiveWith.some((id) => !existingIds.includes(id))) {
    problems.push('Remove "can\'t combine with" programs that no longer exist.')
  }
  return problems
}

/** Points a reward gives for an order; catalogue rewards give an item, not points. */
export function pointsFor(reward: ProgramReward, orderValue: number): number {
  if (reward.type === 'points_per_spend') return Math.floor(orderValue / 100) * reward.points
  if (reward.type === 'fixed_points') return reward.points
  return 0
}

function triggerFires(program: Program, event: ProgramEvent): boolean {
  switch (program.trigger) {
    case 'order_placed':
      return true
    case 'every_nth_visit':
      return !!program.visitInterval && event.visitNumber % program.visitInterval === 0
    case 'birthday':
      return event.isBirthday
  }
}

/**
 * Which active programs apply to one visit. Programs run side by side
 * unless marked "can't combine": then the one created first wins and the
 * other is reported as excluded (Book 3 §2).
 */
export function evaluateVisit(
  programs: Program[],
  customer: Customer,
  event: ProgramEvent,
  segmentMembers: Map<string, Set<string>>,
  rewards: Reward[],
): ProgramOutcome[] {
  const active = programs
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const applied: Program[] = []

  return active.map((program): ProgramOutcome => {
    const base = { programId: program.id, programName: program.name }
    if (program.segmentId && !segmentMembers.get(program.segmentId)?.has(customer.id)) {
      return { ...base, result: 'not_eligible', detail: 'Customer is not in this program’s segment.' }
    }
    if (!triggerFires(program, event)) {
      return { ...base, result: 'not_triggered', detail: `${describeTrigger(program)} — not this visit.` }
    }
    const blocker = applied.find((p) => program.exclusiveWith.includes(p.id) || p.exclusiveWith.includes(program.id))
    if (blocker) {
      return { ...base, result: 'excluded', detail: `Can't be combined with ${blocker.name}, which already applies.` }
    }
    applied.push(program)
    const points = pointsFor(program.reward, event.orderValue)
    return {
      ...base,
      result: 'applies',
      detail:
        program.reward.type === 'catalogue_reward'
          ? `Earns: ${describeReward(program.reward, rewards)}.`
          : `Earns ${points} points.`,
    }
  })
}
