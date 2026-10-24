import type { Customer } from '@/features/customers/types/customer'
import { MESSAGE_CHANNEL_LABELS, type MessageChannel } from '@/features/settings/types/settings'
import { channelAvailability } from '@/features/notifications/utils/messageRouting'
import { firstName, personalize } from '@/utils/messageTokens'
import {
  ACTION_LABELS,
  CONDITION_LABELS,
  HIGH_ORDER_VALUE,
  ORDER_TRIGGERS,
  TRIGGER_LABELS,
  type ConditionType,
  type MessageFallback,
  type TriggerContext,
  type Workflow,
  type WorkflowAction,
  type WorkflowRunStep,
} from '@/features/automation/types/automation'

export function fallbackLabel(fallback: MessageFallback | null): string {
  if (fallback === null) return 'Not set'
  return fallback === 'log_only' ? 'Log only' : MESSAGE_CHANNEL_LABELS[fallback]
}

/** Evaluates one condition. Returns pass/fail plus a plain reason for the run log. */
export function evaluateCondition(
  type: ConditionType,
  customer: Customer,
  trigger: Workflow['triggerType'],
  context: TriggerContext,
): { passed: boolean; detail: string } {
  switch (type) {
    case 'order_value_high': {
      if (!ORDER_TRIGGERS.includes(trigger) || context.orderValue === undefined) {
        return { passed: false, detail: 'This trigger has no order to check.' }
      }
      const value = `₹${context.orderValue.toLocaleString('en-IN')}`
      return context.orderValue >= HIGH_ORDER_VALUE
        ? { passed: true, detail: `Order value ${value}.` }
        : { passed: false, detail: `Order value ${value} is below ₹${HIGH_ORDER_VALUE.toLocaleString('en-IN')}.` }
    }
    case 'has_loyalty_points': {
      const points = customer.loyaltyPoints ?? 0
      return points > 0
        ? { passed: true, detail: `${points} points.` }
        : { passed: false, detail: 'No loyalty points.' }
    }
    case 'is_repeat_customer':
      return customer.orderCount >= 2
        ? { passed: true, detail: `${customer.orderCount} orders.` }
        : { passed: false, detail: `${customer.orderCount} order${customer.orderCount === 1 ? '' : 's'}.` }
  }
}

/**
 * Which channel a message action would use for this customer: the main
 * channel, else the fallback channel, else log only. Mirrors the
 * Notification Engine's per-channel opt-outs (a WhatsApp opt-out still
 * allows SMS). Provider failures can't be predicted, so a test shows the
 * planned route, not a delivery result.
 */
export function plannedRoute(action: Extract<WorkflowAction, { type: 'send_message' }>, customer: Customer): string {
  const tryChannel = (channel: MessageChannel) => channelAvailability(customer, channel) === 'ok'
  if (tryChannel(action.channel)) return `would go by ${MESSAGE_CHANNEL_LABELS[action.channel]}`
  const why = channelAvailability(customer, action.channel) === 'opted_out' ? 'opted out of' : 'has no address for'
  const skip = `Customer ${why} ${MESSAGE_CHANNEL_LABELS[action.channel]}`
  if (action.fallback && action.fallback !== 'log_only' && tryChannel(action.fallback)) {
    return `${skip}, so it would go by ${MESSAGE_CHANNEL_LABELS[action.fallback]} (fallback)`
  }
  return `${skip}, so it would only be logged`
}

/**
 * Book 3 §3 linear rule evaluation for one customer: trigger → every
 * condition in order (stop at the first that fails) → timing → actions.
 * Pure: in test mode actions are described, never performed.
 */
export function simulateRun(
  workflow: Workflow,
  customer: Customer,
  context: TriggerContext,
  businessName: string,
): { completed: boolean; steps: WorkflowRunStep[] } {
  const steps: WorkflowRunStep[] = [
    {
      kind: 'trigger',
      label: TRIGGER_LABELS[workflow.triggerType],
      outcome: 'passed',
      detail:
        context.orderValue !== undefined && ORDER_TRIGGERS.includes(workflow.triggerType)
          ? `Test event: order of ₹${context.orderValue.toLocaleString('en-IN')}.`
          : 'Test event.',
    },
  ]

  for (const condition of workflow.conditions) {
    const { passed, detail } = evaluateCondition(condition.type, customer, workflow.triggerType, context)
    steps.push({ kind: 'condition', label: CONDITION_LABELS[condition.type], outcome: passed ? 'passed' : 'failed', detail })
    if (!passed) return { completed: false, steps }
  }

  if (workflow.timing === 'delayed') {
    steps.push({
      kind: 'timing',
      label: `Wait ${workflow.delayMinutes} minutes`,
      outcome: 'would_do',
      detail: 'Skipped in a test. Live runs wait before the actions.',
    })
  }

  for (const action of workflow.actions) {
    if (action.type === 'send_message') {
      const text = personalize(action.message, { first_name: firstName(customer.name), business_name: businessName })
      steps.push({
        kind: 'action',
        label: ACTION_LABELS.send_message,
        outcome: 'would_do',
        detail: `"${text}" — ${plannedRoute(action, customer)}.`,
      })
    } else if (action.type === 'add_loyalty_points') {
      steps.push({
        kind: 'action',
        label: ACTION_LABELS.add_loyalty_points,
        outcome: 'would_do',
        detail: `Would add ${action.points} points.`,
      })
    } else {
      steps.push({ kind: 'action', label: ACTION_LABELS.flag_for_review, outcome: 'would_do', detail: 'Would flag for manual review.' })
    }
  }
  return { completed: true, steps }
}

/**
 * Book 3 §3 publish gate: what must be fixed before a workflow can go
 * live. Empty means it may be activated.
 */
export function publishProblems(workflow: Workflow, testRunCount: number): string[] {
  const problems: string[] = []
  if (workflow.actions.length === 0) problems.push('Add at least one action.')
  for (const action of workflow.actions) {
    if (action.type === 'send_message') {
      if (action.fallback === null) {
        problems.push('Choose a fallback for the message action (another channel, or log only).')
      } else if (action.fallback === action.channel) {
        problems.push('The message fallback must be different from its main channel.')
      }
    }
  }
  if (workflow.status === 'draft' && testRunCount === 0) {
    problems.push('Test the workflow on a sample customer at least once.')
  }
  return problems
}
