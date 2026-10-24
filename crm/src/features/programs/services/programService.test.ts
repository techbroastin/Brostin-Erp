import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Program } from '@/features/programs/types/program'
import { describeTrigger, pointsFor, publishProblems } from '@/features/programs/utils/programRules'
import { EMPTY_PROGRAM_FORM, programSchema, toProgramForm, toProgramInput } from '@/features/programs/schemas/programSchema'

const base: Program = {
  id: 'p1',
  name: 'Test',
  description: '',
  status: 'draft',
  segmentId: null,
  trigger: 'order_placed',
  visitInterval: null,
  reward: { type: 'points_per_spend', points: 5 },
  message: { body: 'Hi', channel: 'whatsapp', fallback: 'sms' },
  costOwner: 'brand',
  exclusiveWith: [],
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
}

describe('program rules', () => {
  test('points per ₹100 round down; fixed points are fixed; catalogue rewards give no points', () => {
    expect(pointsFor({ type: 'points_per_spend', points: 5 }, 850)).toBe(40)
    expect(pointsFor({ type: 'fixed_points', points: 25 }, 850)).toBe(25)
    expect(pointsFor({ type: 'catalogue_reward', rewardId: 'rwd-001' }, 850)).toBe(0)
  })

  test('trigger wording', () => {
    expect(describeTrigger({ trigger: 'every_nth_visit', visitInterval: 3 })).toBe('Every 3rd visit')
    expect(describeTrigger({ trigger: 'every_nth_visit', visitInterval: 11 })).toBe('Every 11th visit')
  })

  test('publish gate: cost owner is a hard requirement, and so is a distinct fallback', () => {
    expect(publishProblems(base, ['p1'])).toEqual([])
    expect(publishProblems({ ...base, costOwner: null }, ['p1'])).toEqual([expect.stringContaining('who pays')])
    expect(publishProblems({ ...base, message: { ...base.message, fallback: null } }, ['p1'])).toEqual([
      expect.stringContaining('fallback'),
    ])
    expect(publishProblems({ ...base, exclusiveWith: ['gone'] }, ['p1'])).toEqual([expect.stringContaining('no longer exist')])
  })

  test('form round trip and validation', () => {
    const form = toProgramForm({ ...base, reward: { type: 'catalogue_reward', rewardId: 'rwd-002' }, costOwner: null })
    expect(toProgramInput(form)).toMatchObject({ reward: { type: 'catalogue_reward', rewardId: 'rwd-002' }, costOwner: null })
    const valid = { ...EMPTY_PROGRAM_FORM, name: 'X', messageBody: 'Hi {{first_name}}' }
    expect(programSchema.safeParse(valid).success).toBe(true)
    expect(programSchema.safeParse({ ...valid, trigger: 'every_nth_visit', visitInterval: 1 }).success).toBe(false)
    expect(programSchema.safeParse({ ...valid, rewardType: 'catalogue_reward', rewardId: '' }).success).toBe(false)
    expect(programSchema.safeParse({ ...valid, fallback: 'whatsapp' }).success).toBe(false)
  })
})

describe('programService', () => {
  let service: typeof import('./programService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./programService')
  })

  const input = {
    name: 'Weekday lunch',
    description: '',
    segmentId: null,
    trigger: 'order_placed' as const,
    visitInterval: null,
    reward: { type: 'fixed_points' as const, points: 20 },
    message: { body: 'Hi', channel: 'whatsapp' as const, fallback: 'sms' as const },
    costOwner: 'outlet' as const,
    exclusiveWith: ['prog-002'],
  }

  test('new programs are drafts; "can\'t combine" is set on both programs', async () => {
    const created = await service.createProgram(input)
    expect(created.status).toBe('draft')
    expect((await service.getProgram('prog-002'))?.exclusiveWith).toContain(created.id)

    await service.updateProgram(created.id, { ...input, exclusiveWith: [] })
    expect((await service.getProgram('prog-002'))?.exclusiveWith).not.toContain(created.id)
  })

  test('the cost-owner gate blocks publishing', async () => {
    await expect(service.setProgramStatus('prog-004', 'active')).rejects.toThrow('who pays')
  })

  test('lifecycle: draft → active → paused → archived, and archived is final', async () => {
    const created = await service.createProgram({ ...input, exclusiveWith: [] })
    await service.setProgramStatus(created.id, 'active')
    await expect(service.updateProgram(created.id, input)).rejects.toThrow('Pause')
    await service.setProgramStatus(created.id, 'paused')
    await service.setProgramStatus(created.id, 'archived')
    await expect(service.setProgramStatus(created.id, 'active')).rejects.toThrow("can’t be active")
    await expect(service.updateProgram(created.id, input)).rejects.toThrow('Archived')
  })

  test('duplicate names are rejected', async () => {
    await expect(service.createProgram({ ...input, name: 'points on every order' })).rejects.toThrow('already exists')
  })

  test('try a visit: triggers, segments and "can\'t combine" decide what applies', async () => {
    // prog-003 (VIP double points) is exclusive with prog-001; activate it to see the exclusion.
    await service.setProgramStatus('prog-003', 'active')
    const segments = await import('@/features/segments/services/segmentService')
    const vip = (await segments.getSegmentDetail('seg-vip'))!.members[0]

    const outcomes = await service.simulateVisit({ customerId: vip.id, orderValue: 850, visitNumber: 5, isBirthday: false })
    const byId = Object.fromEntries(outcomes.map((o) => [o.programId, o]))
    expect(byId['prog-001']).toMatchObject({ result: 'applies', detail: 'Earns 40 points.' })
    expect(byId['prog-002']).toMatchObject({ result: 'applies' })
    expect(byId['prog-003']).toMatchObject({ result: 'excluded' })
    expect(byId['prog-004']).toBeUndefined() // drafts never apply

    const notFifth = await service.simulateVisit({ customerId: vip.id, orderValue: 850, visitNumber: 4, isBirthday: false })
    expect(notFifth.find((o) => o.programId === 'prog-002')?.result).toBe('not_triggered')
  })
})
