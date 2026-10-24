/**
 * Campaign Template Library types — Book 3 §4: templates tagged by
 * occasion (festival, launch, generic) and audience (any segment, or a
 * suggested one). Mock-only, session-only.
 */

export type TemplateOccasion = 'festival' | 'launch' | 'generic'

export type CampaignTemplate = {
  id: string
  name: string
  occasion: TemplateOccasion
  /** The segment this template is written for; null = suits any segment. */
  segmentId: string | null
  /** Message text; may contain {{first_name}} and {{business_name}}. */
  body: string
  createdAt: string
  updatedAt: string
}

export type CampaignTemplateSummary = CampaignTemplate & {
  /** Null when segmentId is null, or the segment has since been deleted. */
  segmentName: string | null
}

export type TemplateInput = {
  name: string
  occasion: TemplateOccasion
  segmentId: string | null
  body: string
}

export type TemplateListParams = {
  occasion: TemplateOccasion | 'all'
}
