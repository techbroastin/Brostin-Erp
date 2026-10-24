import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Customer } from '@/features/customers/types/customer'
import type { Workflow } from '@/features/automation/types/automation'
import { evaluateCondition, plannedRoute, publishProblems, simulateRun } from '@/features/automation/utils/workflowEngine'
import { EMPTY_WORKFLOW_FORM, toWorkflowForm, toWorkflowInput, workflowSchema } from '@/features/automation/schemas/workflowSchema'

const customer: Customer = {
  id: 'c1',
  name: 'Asha Menon',
  phone: '+91 900',
  dateOfBirth: null,
  anniversaryDate: null,
  firstVisitAt: null,
  lastOrderAt: null,
  orderCount: 3,
  lifetimeSpend: 2000,
  preferredOutlets: [],
  preferenceTags: [],
  whatsappOptIn: true,
  segments: [],
  activePrograms: [],
  loyaltyPoints: 120,
  alert: null,
  archivedAt: null,
  archiveReason: null,
  mergedIntoId: null,
}

const workflow: Workflow = {
  id: 'wf-x',
  name: 'Test',
  status: 'draft',
  triggerType: 'order_placed',
  conditions: [
    { id: 'c1', type: 'is_repeat_customer' },
    { id: 'c2', type: 'order_value_high' },
  ],
  actions: [
    { id: 'a1', type: 'send_message', message: 'Hi {{first_name}} from {{business_name}}', channel: 'whatsapp', fallback: 'sms' },
    { id: 'a2', type: 'add_loyalty_points', points: 50 },
  ],
  timing: 'delayed',
  delayMinutes: 30,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
}

describe('workflow engine', () => {
  test('conditions evaluate with stated thresholds', () => {
    expect(evaluateCondition('order_value_high', customer, 'order_placed', { orderValue: 1000 }).passed).toBe(true)
    expect(evaluateCondition('order_value_high', customer, 'order_placed', { orderValue: 999 }).passed).toBe(false)
    expect(evaluateCondition('order_value_high', customer, 'customer_inactive_30d', {}).passed).toBe(false)
    expect(evaluateCondition('is_repeat_customer', { ...customer, orderCount: 1 }, 'order_placed', {}).passed).toBe(false)
    expect(evaluateCondition('has_loyalty_points', { ...customer, loyaltyPoints: null }, 'order_placed', {}).passed).toBe(false)
  })

  test('a passing run lists trigger, conditions, wait and actions in order', () => {
    const run = simulateRun(workflow, customer, { orderValue: 1500 }, 'Broastin')
    expect(run.completed).toBe(true)
    expect(run.steps.map((s) => s.kind)).toEqual(['trigger', 'condition', 'condition', 'timing', 'action', 'action'])
    expect(run.steps[4].detail).toContain('"Hi Asha from Broastin"')
    expect(run.steps[4].detail).toContain('would go by WhatsApp')
  })

  test('the first failing condition stops the run before any action', () => {
    const run = simulateRun(workflow, customer, { orderValue: 300 }, 'Broastin')
    expect(run.completed).toBe(false)
    expect(run.steps.at(-1)).toMatchObject({ kind: 'condition', outcome: 'failed' })
    expect(run.steps.some((s) => s.kind === 'action')).toBe(false)
  })

  test('planned route respects WhatsApp opt-out and the fallback', () => {
    const send = workflow.actions[0] as Extract<Workflow['actions'][number], { type: 'send_message' }>
    const optedOut = { ...customer, whatsappOptIn: false }
    expect(plannedRoute(send, optedOut)).toContain('go by SMS (fallback)')
    expect(plannedRoute({ ...send, fallback: 'log_only' }, optedOut)).toContain('only be logged')
  })

  test('publish gate: fallback required, must differ from the channel, drafts need a test', () => {
    const noFallback: Workflow = {
      ...workflow,
      actions: [{ id: 'a', type: 'send_message', message: 'x', channel: 'whatsapp', fallback: null }],
    }
    expect(publishProblems(noFallback, 1)).toEqual([expect.stringContaining('fallback')])
    expect(publishProblems(workflow, 0)).toEqual([expect.stringContaining('Test the workflow')])
    expect(publishProblems({ ...workflow, status: 'paused' }, 0)).toEqual([])
    expect(publishProblems(workflow, 1)).toEqual([])
  })
})

describe('workflow form', () => {
  test('requires at least one action and a valid message', () => {
    const base = { ...EMPTY_WORKFLOW_FORM, name: 'X', triggerType: 'order_placed' }
    expect(workflowSchema.safeParse(base).success).toBe(false)
    expect(
      workflowSchema.safeParse({ ...base, sendMessage: { ...base.sendMessage, enabled: true, message: 'Hi {{coupon}}' } }).success,
    ).toBe(false)
    expect(workflowSchema.safeParse({ ...base, flag: { enabled: true } }).success).toBe(true)
  })

  test('form <-> workflow round trip keeps action settings; unset fallback becomes null', () => {
    const form = toWorkflowForm(workflow)
    const input = toWorkflowInput({ ...form, sendMessage: { ...form.sendMessage, fallback: '' } })
    expect(input.actions).toEqual([
      { type: 'send_message', message: 'Hi {{first_name}} from {{business_name}}', channel: 'whatsapp', fallback: null },
      { type: 'add_loyalty_points', points: 50 },
    ])
  })
})

describe('automationService engine', () => {
  let service: typeof import('./automationService')
  let audit: typeof import('@/features/audit/services/auditService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./automationService')
    audit = await import('@/features/audit/services/auditService')
  })

  test('a workflow without a message fallback cannot be activated', async () => {
    await expect(service.updateWorkflowStatus('wf-002', 'active')).rejects.toThrow('fallback')
  })

  test('a draft goes live only after a test run, and every run is logged', async () => {
    await expect(service.updateWorkflowStatus('wf-003', 'active')).rejects.toThrow('Test the workflow')

    const run = await service.testWorkflow('wf-003', 'cust-001', { orderValue: 1200 })
    expect(run.mode).toBe('test')
    expect((await service.listWorkflowRuns('wf-003')).map((r) => r.id)).toEqual([run.id])

    const activated = await service.updateWorkflowStatus('wf-003', 'active')
    expect(activated?.status).toBe('active')
    const actions = (await audit.listAuditEntries({ search: '', category: 'marketing' })).map((e) => e.action)
    expect(actions).toContain('Activated workflow')
  })

  test('editing requires a paused/draft workflow and resets the test requirement', async () => {
    await expect(
      service.updateWorkflow('wf-001', { name: 'X', triggerType: 'order_placed', conditionTypes: [], actions: [{ type: 'flag_for_review' }], timing: 'immediate', delayMinutes: null }),
    ).rejects.toThrow('Pause')

    await service.testWorkflow('wf-003', 'cust-001', { orderValue: 1200 })
    expect(await service.getPublishProblems('wf-003')).toEqual([])
    await new Promise((r) => setTimeout(r, 5))
    await service.updateWorkflow('wf-003', {
      name: 'Reward High-Value Orders',
      triggerType: 'order_placed',
      conditionTypes: ['order_value_high'],
      actions: [{ type: 'add_loyalty_points', points: 75 }],
      timing: 'immediate',
      delayMinutes: null,
    })
    expect(await service.getPublishProblems('wf-003')).toEqual([expect.stringContaining('Test the workflow')])
  })

  test('test runs never send messages', async () => {
    const notifications = await import('@/features/notifications/services/notificationService')
    const before = (await notifications.listMessages({ search: '', status: 'all' })).length
    await service.testWorkflow('wf-001', 'cust-002', { orderValue: 500 })
    expect((await notifications.listMessages({ search: '', status: 'all' })).length).toBe(before)
  })
})
