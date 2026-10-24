import { z } from 'zod'
import { messageSchema } from '@/features/campaigns/schemas/campaignSchema'
import type {
  ActionType,
  ConditionType,
  TriggerType,
  WorkflowAction,
  WorkflowInput,
} from '@/features/automation/types/automation'

const MAX_POINTS = 10000

/**
 * Create/Edit Workflow form schema — docs/FRONTEND_ARCHITECTURE.md §19.
 * Actions are a flat on/off list with each one's settings, so the form
 * can keep settings while an action is switched off. A missing message
 * fallback is allowed here (drafts may be unfinished); the publish gate
 * blocks going live without one (Book 3 §3).
 */
export const workflowSchema = z
  .object({
    name: z.string().trim().min(1, 'Workflow name is required.').max(120, 'Workflow name is too long.'),
    triggerType: z.string().min(1, 'Select a trigger.'),
    conditionTypes: z.array(z.string()),
    sendMessage: z.object({
      enabled: z.boolean(),
      message: z.string(),
      channel: z.enum(['whatsapp', 'sms', 'email']),
      /** '' = not chosen yet. */
      fallback: z.enum(['', 'whatsapp', 'sms', 'email', 'log_only']),
    }),
    addPoints: z.object({ enabled: z.boolean(), points: z.number() }),
    flag: z.object({ enabled: z.boolean() }),
    timing: z.enum(['immediate', 'delayed']),
    delayMinutes: z.number().nullable(),
  })
  .superRefine((v, ctx) => {
    if (!v.sendMessage.enabled && !v.addPoints.enabled && !v.flag.enabled) {
      ctx.addIssue({ code: 'custom', path: ['flag', 'enabled'], message: 'Select at least one action.' })
    }
    if (v.sendMessage.enabled) {
      const result = messageSchema.safeParse(v.sendMessage.message)
      if (!result.success) {
        ctx.addIssue({ code: 'custom', path: ['sendMessage', 'message'], message: result.error.issues[0].message })
      }
      if (v.sendMessage.fallback === v.sendMessage.channel) {
        ctx.addIssue({ code: 'custom', path: ['sendMessage', 'fallback'], message: 'Pick a different channel than the main one.' })
      }
    }
    if (v.addPoints.enabled && (!Number.isInteger(v.addPoints.points) || v.addPoints.points < 1 || v.addPoints.points > MAX_POINTS)) {
      ctx.addIssue({ code: 'custom', path: ['addPoints', 'points'], message: `Enter 1 to ${MAX_POINTS} points.` })
    }
    if (v.timing === 'delayed' && !((v.delayMinutes ?? 0) > 0)) {
      ctx.addIssue({ code: 'custom', path: ['delayMinutes'], message: 'Enter a delay in minutes.' })
    }
  })

export type WorkflowFormValues = z.infer<typeof workflowSchema>

export const EMPTY_WORKFLOW_FORM: WorkflowFormValues = {
  name: '',
  triggerType: '',
  conditionTypes: [],
  sendMessage: { enabled: false, message: '', channel: 'whatsapp', fallback: '' },
  addPoints: { enabled: false, points: 50 },
  flag: { enabled: false },
  timing: 'immediate',
  delayMinutes: null,
}

export function toWorkflowInput(v: WorkflowFormValues): WorkflowInput {
  const actions: WorkflowInput['actions'] = []
  if (v.sendMessage.enabled) {
    actions.push({
      type: 'send_message',
      message: v.sendMessage.message.trim(),
      channel: v.sendMessage.channel,
      fallback: v.sendMessage.fallback === '' ? null : v.sendMessage.fallback,
    })
  }
  if (v.addPoints.enabled) actions.push({ type: 'add_loyalty_points', points: v.addPoints.points })
  if (v.flag.enabled) actions.push({ type: 'flag_for_review' })
  return {
    name: v.name.trim(),
    triggerType: v.triggerType as TriggerType,
    conditionTypes: v.conditionTypes as ConditionType[],
    actions,
    timing: v.timing,
    delayMinutes: v.timing === 'delayed' ? v.delayMinutes : null,
  }
}

/** Fills the form from an existing workflow, for editing. */
export function toWorkflowForm(w: {
  name: string
  triggerType: TriggerType
  conditions: { type: ConditionType }[]
  actions: WorkflowAction[]
  timing: 'immediate' | 'delayed'
  delayMinutes: number | null
}): WorkflowFormValues {
  const find = <T extends ActionType>(type: T) =>
    w.actions.find((a): a is Extract<WorkflowAction, { type: T }> => a.type === type)
  const send = find('send_message')
  const points = find('add_loyalty_points')
  return {
    name: w.name,
    triggerType: w.triggerType,
    conditionTypes: w.conditions.map((c) => c.type),
    sendMessage: send
      ? { enabled: true, message: send.message, channel: send.channel, fallback: send.fallback ?? '' }
      : EMPTY_WORKFLOW_FORM.sendMessage,
    addPoints: points ? { enabled: true, points: points.points } : EMPTY_WORKFLOW_FORM.addPoints,
    flag: { enabled: !!find('flag_for_review') },
    timing: w.timing,
    delayMinutes: w.delayMinutes,
  }
}
