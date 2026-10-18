/**
 * Automation feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * docs/IMPLEMENTATION_PLAN.md §19 ("Phase 16 — Automation") names a
 * potential structure (Trigger → Conditions → Actions → Timing →
 * Status) but defines no actual trigger/condition/action taxonomy,
 * timing/scheduling model, or status set anywhere. Everything below is
 * an explicitly illustrative placeholder, approved for this mock-only
 * implementation — never a finalized Broastin business rule, and never
 * wired to any real execution, scheduler, or notification delivery
 * (docs/IMPLEMENTATION_PLAN.md §19: "Do not implement a production
 * automation engine merely to complete the UI").
 */

export type WorkflowStatus = 'draft' | 'active' | 'paused'

export type WorkflowTiming = 'immediate' | 'delayed'

export type TriggerType =
  | 'customer_first_order'
  | 'customer_inactive_30d'
  | 'loyalty_points_earned'
  | 'order_placed'

export type ConditionType = 'order_value_high' | 'has_loyalty_points' | 'is_repeat_customer'

export type ActionType = 'send_message' | 'add_loyalty_points' | 'flag_for_review'

export type WorkflowCondition = {
  id: string
  type: ConditionType
}

export type WorkflowAction = {
  id: string
  type: ActionType
}

export type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  triggerType: TriggerType
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  timing: WorkflowTiming
  /** Only meaningful when timing === 'delayed'. Never used to schedule anything real. */
  delayMinutes: number | null
  createdAt: string
}

export type WorkflowSortBy = 'createdAt' | 'name'

export type WorkflowListParams = {
  search: string
  page: number
  pageSize: number
  sortBy: WorkflowSortBy
}

export type WorkflowListResult = {
  items: Workflow[]
  total: number
}

export type AutomationOverview = {
  totalWorkflows: number
  draftCount: number
  activeCount: number
  pausedCount: number
}

export type CreateWorkflowInput = {
  name: string
  triggerType: TriggerType
  conditionTypes: ConditionType[]
  actionTypes: ActionType[]
  timing: WorkflowTiming
  delayMinutes: number | null
}

/**
 * Illustrative labels only — see file header. Centralized here so the
 * table, detail view and create wizard never drift out of sync.
 */
export const TRIGGER_LABELS: Record<TriggerType, string> = {
  customer_first_order: 'Customer places first order',
  customer_inactive_30d: 'Customer inactive for 30+ days',
  loyalty_points_earned: 'Customer earns loyalty points',
  order_placed: 'Order is placed',
}

export const CONDITION_LABELS: Record<ConditionType, string> = {
  order_value_high: 'Order value is high',
  has_loyalty_points: 'Customer has loyalty points',
  is_repeat_customer: 'Customer has ordered before',
}

export const ACTION_LABELS: Record<ActionType, string> = {
  send_message: 'Send a message to the customer',
  add_loyalty_points: 'Add loyalty points to the customer',
  flag_for_review: 'Flag the customer for manual review',
}
