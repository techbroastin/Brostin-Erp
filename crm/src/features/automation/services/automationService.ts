import type {
  Workflow,
  WorkflowListParams,
  WorkflowListResult,
  AutomationOverview,
  WorkflowStatus,
  CreateWorkflowInput,
} from '@/features/automation/types/automation'
import {
  getWorkflowStore,
  addWorkflowToStore,
  updateWorkflowStatusInStore,
  emptyWorkflows,
  ERROR_SCENARIO_FLAG,
  type AutomationMockScenario,
} from '@/features/automation/mock/automation.mock'

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

/** Status counts only — no execution/run metric exists or is implied. */
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

/**
 * Creates a workflow in the in-memory mock store only — see
 * mock/automation.mock.ts header. Not persisted to any backend, lost
 * on reload. Status starts 'draft' — creating a workflow never
 * activates it.
 */
export async function createWorkflow(input: CreateWorkflowInput): Promise<Workflow> {
  await delay()

  const workflow: Workflow = {
    id: `wf-${Date.now()}`,
    name: input.name,
    status: 'draft',
    triggerType: input.triggerType,
    conditions: input.conditionTypes.map((type, index) => ({ id: `cond-${Date.now()}-${index}`, type })),
    actions: input.actionTypes.map((type, index) => ({ id: `act-${Date.now()}-${index}`, type })),
    timing: input.timing,
    delayMinutes: input.timing === 'delayed' ? input.delayMinutes : null,
    createdAt: new Date().toISOString(),
  }

  addWorkflowToStore(workflow)
  return workflow
}

/**
 * Transitions a workflow's status in the in-memory mock store only.
 * "active" here means "marked as active in mock data" — it never
 * starts monitoring, scheduling, or executing anything real.
 */
export async function updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<Workflow | null> {
  await delay()
  return updateWorkflowStatusInStore(id, status)
}
