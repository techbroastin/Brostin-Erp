import type {
  Workflow,
  WorkflowAction,
  WorkflowListParams,
  WorkflowListResult,
  AutomationOverview,
  WorkflowRun,
  WorkflowStatus,
  WorkflowInput,
  TriggerContext,
} from '@/features/automation/types/automation'
import { TRIGGER_LABELS } from '@/features/automation/types/automation'
import {
  getWorkflowStore,
  addWorkflowToStore,
  replaceWorkflowInStore,
  getRunStore,
  appendRun,
  emptyWorkflows,
  ERROR_SCENARIO_FLAG,
  type AutomationMockScenario,
} from '@/features/automation/mock/automation.mock'
import { fallbackLabel, publishProblems, simulateRun } from '@/features/automation/utils/workflowEngine'
import { getCustomerById } from '@/features/customers/services/customerService'
import { getGeneralSettings } from '@/features/settings/services/settingsService'
import { recordAudit } from '@/features/audit/services/auditService'

const SIMULATED_LATENCY_MS = 500

function delay() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))
}

function getSourceDataset(scenario: AutomationMockScenario): Workflow[] {
  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load workflows.')
  }
  return scenario === 'empty' ? emptyWorkflows : getWorkflowStore()
}

export async function listWorkflows(
  params: WorkflowListParams,
  scenario: AutomationMockScenario = 'normal',
): Promise<WorkflowListResult> {
  await delay()

  const source = getSourceDataset(scenario)

  const search = params.search.trim().toLowerCase()
  const filtered = search ? source.filter((w) => w.name.toLowerCase().includes(search)) : source

  const sorted = [...filtered].sort((a, b) => {
    if (params.sortBy === 'name') return a.name.localeCompare(b.name)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const start = (params.page - 1) * params.pageSize
  const items = sorted.slice(start, start + params.pageSize)

  return { items, total: sorted.length }
}

export async function getWorkflowById(
  id: string,
  scenario: AutomationMockScenario = 'normal',
): Promise<Workflow | null> {
  await delay()

  const source = getSourceDataset(scenario)
  return source.find((w) => w.id === id) ?? null
}

/** Status counts only. */
export async function getAutomationOverview(
  scenario: AutomationMockScenario = 'normal',
): Promise<AutomationOverview> {
  await delay()

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load automation overview.')
  }

  const source = scenario === 'empty' ? emptyWorkflows : getWorkflowStore()

  return {
    totalWorkflows: source.length,
    draftCount: source.filter((w) => w.status === 'draft').length,
    activeCount: source.filter((w) => w.status === 'active').length,
    pausedCount: source.filter((w) => w.status === 'paused').length,
  }
}

let nextActionId = 1

function buildActions(input: WorkflowInput): WorkflowAction[] {
  return input.actions.map((action) => ({ ...action, id: `act-${Date.now()}-${nextActionId++}` }) as WorkflowAction)
}

function buildConditions(input: WorkflowInput): Workflow['conditions'] {
  return input.conditionTypes.map((type, index) => ({ id: `cond-${Date.now()}-${index}`, type }))
}

function describeActions(actions: WorkflowAction[]): string {
  return actions
    .map((a) =>
      a.type === 'send_message'
        ? `Message (${a.channel}, fallback: ${fallbackLabel(a.fallback)})`
        : a.type === 'add_loyalty_points'
          ? `${a.points} points`
          : 'Flag for review',
    )
    .join('; ')
}

/**
 * Creates a workflow in the in-memory mock store only. Status starts
 * 'draft' — creating a workflow never activates it.
 */
export async function createWorkflow(input: WorkflowInput): Promise<Workflow> {
  await delay()

  const now = new Date().toISOString()
  const workflow: Workflow = {
    id: `wf-${Date.now()}`,
    name: input.name,
    status: 'draft',
    triggerType: input.triggerType,
    conditions: buildConditions(input),
    actions: buildActions(input),
    timing: input.timing,
    delayMinutes: input.timing === 'delayed' ? input.delayMinutes : null,
    createdAt: now,
    updatedAt: now,
  }

  addWorkflowToStore(workflow)
  recordAudit({
    category: 'marketing',
    action: 'Created workflow',
    target: { type: 'workflow', id: workflow.id, label: workflow.name, href: `/automation/${workflow.id}` },
    changes: [{ field: 'Trigger', from: '—', to: TRIGGER_LABELS[workflow.triggerType] }],
  })
  return workflow
}

/**
 * Edits a draft or paused workflow. An active workflow must be paused
 * first, so a live rule never changes underneath running events. Any
 * edit means it needs testing again before it can go live as a draft.
 */
export async function updateWorkflow(id: string, input: WorkflowInput): Promise<Workflow> {
  await delay()
  const existing = getWorkflowStore().find((w) => w.id === id)
  if (!existing) throw new Error('Workflow not found.')
  if (existing.status === 'active') throw new Error('Pause this workflow before editing it.')

  const updated: Workflow = {
    ...existing,
    name: input.name,
    triggerType: input.triggerType,
    conditions: buildConditions(input),
    actions: buildActions(input),
    timing: input.timing,
    delayMinutes: input.timing === 'delayed' ? input.delayMinutes : null,
    updatedAt: new Date().toISOString(),
  }
  replaceWorkflowInStore(updated)
  const changes = [
    { field: 'Name', from: existing.name, to: updated.name },
    { field: 'Trigger', from: TRIGGER_LABELS[existing.triggerType], to: TRIGGER_LABELS[updated.triggerType] },
    { field: 'Actions', from: describeActions(existing.actions), to: describeActions(updated.actions) },
  ].filter((c) => c.from !== c.to)
  recordAudit({
    category: 'marketing',
    action: 'Edited workflow',
    target: { type: 'workflow', id, label: updated.name, href: `/automation/${id}` },
    changes,
  })
  return updated
}

/** Test runs since the workflow was last changed — older tests don't count for the publish gate. */
function testRunsSinceEdit(workflow: Workflow): number {
  const since = new Date(workflow.updatedAt).getTime()
  return getRunStore().filter(
    (r) => r.workflowId === workflow.id && r.mode === 'test' && new Date(r.at).getTime() >= since,
  ).length
}

/** Book 3 §3 publish gate problems for a workflow, for the detail page checklist. */
export async function getPublishProblems(id: string): Promise<string[]> {
  await delay()
  const workflow = getWorkflowStore().find((w) => w.id === id)
  if (!workflow) throw new Error('Workflow not found.')
  return publishProblems(workflow, testRunsSinceEdit(workflow))
}

/**
 * Changes a workflow's status. Going live ('active') passes the Book 3
 * §3 publish gate first; the error lists every problem. Nothing is
 * monitored yet — live runs need the POS/QR event feed.
 */
export async function updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<Workflow | null> {
  await delay()
  const existing = getWorkflowStore().find((w) => w.id === id)
  if (!existing) return null
  if (status === 'active') {
    const problems = publishProblems(existing, testRunsSinceEdit(existing))
    if (problems.length > 0) throw new Error(problems.join(' '))
  }
  const updated: Workflow = { ...existing, status }
  replaceWorkflowInStore(updated)
  if (existing.status !== status) {
    recordAudit({
      category: 'marketing',
      action: status === 'active' ? 'Activated workflow' : status === 'paused' ? 'Paused workflow' : 'Changed workflow status',
      target: { type: 'workflow', id, label: existing.name, href: `/automation/${id}` },
      changes: [{ field: 'Status', from: existing.status, to: status }],
    })
  }
  return updated
}

/**
 * Book 3 §3 Test/Simulate mode: runs the workflow's rules against one
 * real customer as if the trigger had just fired. Nothing is sent and
 * no points are given; the run is still logged (mode 'test').
 */
export async function testWorkflow(id: string, customerId: string, context: TriggerContext): Promise<WorkflowRun> {
  const workflow = getWorkflowStore().find((w) => w.id === id)
  if (!workflow) throw new Error('Workflow not found.')
  const [customer, { businessName }] = await Promise.all([getCustomerById(customerId), getGeneralSettings()])
  if (!customer) throw new Error('Customer not found.')

  const { completed, steps } = simulateRun(workflow, customer, context, businessName)
  const run: WorkflowRun = {
    id: `run-${Date.now()}-${getRunStore().length + 1}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    mode: 'test',
    customerId: customer.id,
    customerName: customer.name,
    at: new Date().toISOString(),
    completed,
    steps,
  }
  appendRun(run)
  return run
}

/** Run log, newest first — for one workflow, or all workflows. */
export async function listWorkflowRuns(workflowId?: string): Promise<WorkflowRun[]> {
  await delay()
  return getRunStore()
    .filter((r) => !workflowId || r.workflowId === workflowId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}
