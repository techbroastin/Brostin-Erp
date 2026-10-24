import type { MessageChannel } from '@/features/settings/types/settings'

/**
 * Automation feature types — Book 3 §3 Workflow Engine, MVP: simple
 * linear rules (Trigger → Conditions → Actions → Timing), no visual
 * canvas (Phase 2). Triggers, conditions and actions are a fixed,
 * reusable catalogue with stated thresholds — illustrative starting
 * rules, not finalized Broastin business rules.
 *
 * Live runs need real events (orders, visits, points) from the POS/QR
 * feed, which arrives with backend integration. Until then workflows
 * can be tested against a sample customer; every run, test or live, is
 * logged (Book 3 §3).
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

/** Order value at or above this counts as "high" for the order_value_high condition. */
export const HIGH_ORDER_VALUE = 1000

export type WorkflowCondition = {
  id: string
  type: ConditionType
}

/**
 * Book 3 §3: a message action must name a fallback (another channel, or
 * "log only") before the workflow can go live. Null = not chosen yet,
 * which is allowed in a draft.
 */
export type MessageFallback = MessageChannel | 'log_only'

export type SendMessageAction = {
  id: string
  type: 'send_message'
  message: string
  channel: MessageChannel
  fallback: MessageFallback | null
}

export type AddPointsAction = {
  id: string
  type: 'add_loyalty_points'
  points: number
}

export type FlagAction = {
  id: string
  type: 'flag_for_review'
}

export type WorkflowAction = SendMessageAction | AddPointsAction | FlagAction

export type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  triggerType: TriggerType
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  timing: WorkflowTiming
  /** Only meaningful when timing === 'delayed'. */
  delayMinutes: number | null
  createdAt: string
  updatedAt: string
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

type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never
export type WorkflowActionInput = WithoutId<WorkflowAction>

export type WorkflowInput = {
  name: string
  triggerType: TriggerType
  conditionTypes: ConditionType[]
  actions: WorkflowActionInput[]
  timing: WorkflowTiming
  delayMinutes: number | null
}

/** What happened when the trigger fired, for conditions that need it. */
export type TriggerContext = {
  /** Order value in rupees, for order-based triggers. */
  orderValue?: number
}

export type RunStepOutcome = 'passed' | 'failed' | 'done' | 'would_do'

export type WorkflowRunStep = {
  kind: 'trigger' | 'condition' | 'timing' | 'action'
  label: string
  outcome: RunStepOutcome
  detail: string
}

/** Book 3 §3: every run is logged — which customer, which path, what fired. */
export type WorkflowRun = {
  id: string
  workflowId: string
  workflowName: string
  mode: 'test' | 'live'
  customerId: string
  customerName: string
  at: string
  /** True if every condition passed and the actions ran (or would run, in a test). */
  completed: boolean
  steps: WorkflowRunStep[]
}

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  customer_first_order: 'Customer places first order',
  customer_inactive_30d: 'Customer inactive for 30+ days',
  loyalty_points_earned: 'Customer earns loyalty points',
  order_placed: 'Order is placed',
}

/** Triggers that come with an order, so order_value_high can be checked. */
export const ORDER_TRIGGERS: TriggerType[] = ['customer_first_order', 'order_placed']

export const CONDITION_LABELS: Record<ConditionType, string> = {
  order_value_high: `Order value is ₹${HIGH_ORDER_VALUE.toLocaleString('en-IN')} or more`,
  has_loyalty_points: 'Customer has loyalty points',
  is_repeat_customer: 'Customer has ordered before (2+ orders)',
}

export const ACTION_LABELS: Record<ActionType, string> = {
  send_message: 'Send a message to the customer',
  add_loyalty_points: 'Add loyalty points to the customer',
  flag_for_review: 'Flag the customer for manual review',
}
