import type { TemplateOccasion } from '@/features/campaigns/types/template'

/** Placeholder helpers are shared with Automation; re-exported here for existing campaign imports. */
export {
  MESSAGE_TOKENS,
  firstName,
  personalize,
  unknownTokens,
  type MessageToken,
  type TokenValues,
} from '@/utils/messageTokens'

export const OCCASION_LABELS: Record<TemplateOccasion, string> = {
  festival: 'Festival',
  launch: 'Launch',
  generic: 'Generic',
}

export const TEMPLATE_OCCASIONS = Object.keys(OCCASION_LABELS) as TemplateOccasion[]
