import type { Workflow, WorkflowStatus } from '@/features/automation/types/automation'

/**
 * Automation mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/automation/services/automationService.ts may import
 * this file.
 *
 * Mutable in memory, same discipline as campaigns/mock/campaigns.mock.ts:
 * Create Workflow and status transitions are session-only — new/updated
 * workflows are lost on reload. "active"/"paused" are mock UI state
 * only; nothing here is ever monitored, scheduled, or executed.
 *
 * Illustrative placeholders only — not real workflows, not final
 * business rules. See DemoDataBadge wherever this data renders.
 */

function seedWorkflows(): Workflow[] {
  const now = Date.now()
  return [
    {
      id: 'wf-001',
      name: 'Welcome First-Time Customers',
      status: 'active',
      triggerType: 'customer_first_order',
      conditions: [],
      actions: [{ id: 'act-001', type: 'send_message' }],
      timing: 'immediate',
      delayMinutes: null,
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wf-002',
      name: 'Win Back Inactive Customers',
      status: 'paused',
      triggerType: 'customer_inactive_30d',
      conditions: [{ id: 'cond-001', type: 'is_repeat_customer' }],
      actions: [{ id: 'act-002', type: 'send_message' }],
      timing: 'delayed',
      delayMinutes: 60,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wf-003',
      name: 'Reward High-Value Orders',
      status: 'draft',
      triggerType: 'order_placed',
      conditions: [{ id: 'cond-002', type: 'order_value_high' }],
      actions: [{ id: 'act-003', type: 'add_loyalty_points' }],
      timing: 'immediate',
      delayMinutes: null,
      createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

/** Mutable in-session store — see file header. */
let workflowStore: Workflow[] = seedWorkflows()

export function getWorkflowStore(): Workflow[] {
  return workflowStore
}

export function addWorkflowToStore(workflow: Workflow): void {
  workflowStore = [workflow, ...workflowStore]
}

export function updateWorkflowStatusInStore(id: string, status: WorkflowStatus): Workflow | null {
  let updated: Workflow | null = null
  workflowStore = workflowStore.map((w) => {
    if (w.id !== id) return w
    updated = { ...w, status }
    return updated
  })
  return updated
}

export const emptyWorkflows: Workflow[] = []

/**
 * Not a data scenario — a sentinel automationService checks for to
 * throw a simulated failure, exercising AutomationErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type AutomationMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
