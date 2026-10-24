import type { Program } from '@/features/programs/types/program'

/**
 * Programs mock data — feature-local, per docs/FRONTEND_ARCHITECTURE.md
 * §6/§16. Only src/features/programs/services/programService.ts may
 * import this file. MUTABLE in memory (session-only).
 *
 * Illustrative programs only — the earning rules are examples an owner
 * might set up, not approved Broastin loyalty rules. "Birthday treat"
 * has no cost owner yet, to show the publish gate.
 */

function seedPrograms(): Program[] {
  const at = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'prog-001',
      name: 'Points on every order',
      description: 'Earn points on every order, for every customer.',
      status: 'active',
      segmentId: null,
      trigger: 'order_placed',
      visitInterval: null,
      reward: { type: 'points_per_spend', points: 5 },
      message: {
        body: 'Thanks {{first_name}}! You just earned points at {{business_name}}.',
        channel: 'whatsapp',
        fallback: 'sms',
      },
      costOwner: 'brand',
      exclusiveWith: ['prog-003'],
      createdAt: at(60),
      updatedAt: at(60),
    },
    {
      id: 'prog-002',
      name: 'Every 5th visit',
      description: 'A free soft drink on every fifth visit.',
      status: 'active',
      segmentId: null,
      trigger: 'every_nth_visit',
      visitInterval: 5,
      reward: { type: 'catalogue_reward', rewardId: 'rwd-001' },
      message: {
        body: "{{first_name}}, that's 5 visits — your next soft drink at {{business_name}} is free!",
        channel: 'whatsapp',
        fallback: 'sms',
      },
      costOwner: 'outlet',
      exclusiveWith: [],
      createdAt: at(45),
      updatedAt: at(45),
    },
    {
      id: 'prog-003',
      name: 'VIP double points',
      description: 'Double points for our most loyal customers.',
      status: 'paused',
      segmentId: 'seg-vip',
      trigger: 'order_placed',
      visitInterval: null,
      reward: { type: 'points_per_spend', points: 10 },
      message: {
        body: 'Double points for you, {{first_name}} — thanks for being a regular at {{business_name}}!',
        channel: 'whatsapp',
        fallback: 'log_only',
      },
      costOwner: 'brand',
      exclusiveWith: ['prog-001'],
      createdAt: at(30),
      updatedAt: at(30),
    },
    {
      id: 'prog-004',
      name: 'Birthday treat',
      description: 'Free wings when a customer visits on their birthday.',
      status: 'draft',
      segmentId: null,
      trigger: 'birthday',
      visitInterval: null,
      reward: { type: 'catalogue_reward', rewardId: 'rwd-003' },
      message: {
        body: 'Happy birthday, {{first_name}}! Enjoy free wings on us at {{business_name}}.',
        channel: 'whatsapp',
        fallback: 'sms',
      },
      costOwner: null,
      exclusiveWith: [],
      createdAt: at(5),
      updatedAt: at(5),
    },
  ]
}

let programStore: Program[] = seedPrograms()

export function getProgramStore(): Program[] {
  return programStore
}

export function setProgramStore(programs: Program[]): void {
  programStore = programs
}
