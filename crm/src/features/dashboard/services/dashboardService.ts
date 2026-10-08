import type { DashboardSummary } from '@/features/dashboard/types/dashboard'
import {
  normalDashboardSummary,
  emptyDashboardSummary,
  ERROR_SCENARIO_FLAG,
  type DashboardMockScenario,
} from '@/features/dashboard/mock/dashboard.mock'

const SIMULATED_LATENCY_MS = 500

/**
 * The swap point for real data later — nothing above this file (hooks,
 * components, screens) knows the data is mocked. `scenario` lets the
 * normal/empty/error states be exercised without changing any component;
 * production code always calls this with the default ('normal').
 */
export async function getDashboardSummary(
  scenario: DashboardMockScenario = 'normal',
): Promise<DashboardSummary> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  if (scenario === ERROR_SCENARIO_FLAG) {
    throw new Error('Failed to load dashboard summary.')
  }

  return scenario === 'empty' ? emptyDashboardSummary : normalDashboardSummary
}
