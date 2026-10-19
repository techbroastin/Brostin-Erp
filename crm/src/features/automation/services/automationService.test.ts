import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { WorkflowListParams } from '@/features/automation/types/automation'

/**
 * Pure mock-service tests for Automation — deterministic list/filter/
 * sort/create/status-transition logic, no network, no real scheduler/
 * execution involved (none exists). Each test re-imports the module
 * graph (vi.resetModules()) so automation.mock.ts's in-memory store
 * starts from its seed state every time.
 */
describe('automationService', () => {
  let service: typeof import('./automationService')

  const baseParams: WorkflowListParams = {
    search: '',
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
  }

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./automationService')
  })

  test('listWorkflows sorts by createdAt descending by default (newest first)', async () => {
    const { items, total } = await service.listWorkflows(baseParams)

    expect(total).toBe(3)
    expect(items.map((w) => w.id)).toEqual(['wf-003', 'wf-002', 'wf-001'])
  })

  test('listWorkflows sorts alphabetically by name when requested', async () => {
    const { items } = await service.listWorkflows({ ...baseParams, sortBy: 'name' })

    expect(items.map((w) => w.name)).toEqual([
      'Reward High-Value Orders',
      'Welcome First-Time Customers',
      'Win Back Inactive Customers',
    ])
  })

  test('listWorkflows filters by case-insensitive search', async () => {
    const { items, total } = await service.listWorkflows({ ...baseParams, search: 'reward' })

    expect(total).toBe(1)
    expect(items[0]?.id).toBe('wf-003')
  })

  test('listWorkflows paginates results', async () => {
    const firstPage = await service.listWorkflows({ ...baseParams, pageSize: 2, page: 1 })
    const secondPage = await service.listWorkflows({ ...baseParams, pageSize: 2, page: 2 })

    expect(firstPage.items).toHaveLength(2)
    expect(firstPage.total).toBe(3)
    expect(secondPage.items).toHaveLength(1)
  })

  test('listWorkflows returns an empty result for the empty scenario', async () => {
    const { items, total } = await service.listWorkflows(baseParams, 'empty')
    expect(items).toEqual([])
    expect(total).toBe(0)
  })

  test('listWorkflows throws for the error scenario', async () => {
    await expect(service.listWorkflows(baseParams, 'error')).rejects.toThrow('Failed to load workflows.')
  })

  test('getWorkflowById returns null for an unknown id', async () => {
    expect(await service.getWorkflowById('does-not-exist')).toBeNull()
  })

  test('getAutomationOverview counts workflows by status', async () => {
    const overview = await service.getAutomationOverview()

    expect(overview).toEqual({
      totalWorkflows: 3,
      draftCount: 1,
      activeCount: 1,
      pausedCount: 1,
    })
  })

  test('getAutomationOverview throws for the error scenario', async () => {
    await expect(service.getAutomationOverview('error')).rejects.toThrow('Failed to load automation overview.')
  })

  test('createWorkflow adds a draft workflow that appears in the list', async () => {
    const created = await service.createWorkflow({
      name: 'Test Workflow',
      triggerType: 'order_placed',
      conditionTypes: [],
      actionTypes: ['flag_for_review'],
      timing: 'immediate',
      delayMinutes: null,
    })

    expect(created.status).toBe('draft')
    expect(created.delayMinutes).toBeNull()

    const { total } = await service.listWorkflows(baseParams)
    expect(total).toBe(4)
  })

  test('createWorkflow nulls delayMinutes when timing is immediate even if a value was passed', async () => {
    const created = await service.createWorkflow({
      name: 'Immediate Workflow',
      triggerType: 'order_placed',
      conditionTypes: [],
      actionTypes: ['flag_for_review'],
      timing: 'immediate',
      delayMinutes: 45,
    })

    expect(created.delayMinutes).toBeNull()
  })

  test('updateWorkflowStatus transitions an existing workflow and returns it', async () => {
    const updated = await service.updateWorkflowStatus('wf-002', 'active')
    expect(updated?.status).toBe('active')

    const refetched = await service.getWorkflowById('wf-002')
    expect(refetched?.status).toBe('active')
  })

  test('updateWorkflowStatus returns null for an unknown workflow id', async () => {
    expect(await service.updateWorkflowStatus('does-not-exist', 'active')).toBeNull()
  })
})
