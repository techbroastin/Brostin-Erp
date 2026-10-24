import type { CampaignTemplate } from '@/features/campaigns/types/template'

/**
 * Campaign templates mock data — feature-local, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Only
 * src/features/campaigns/services/templateService.ts may import this
 * file. MUTABLE in memory (session-only, lost on reload). Illustrative
 * copy, not approved marketing text.
 */

function seedTemplates(): CampaignTemplate[] {
  const at = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  const t = (id: string, name: string, occasion: CampaignTemplate['occasion'], segmentId: string | null, body: string) => ({
    id,
    name,
    occasion,
    segmentId,
    body,
    createdAt: at,
    updatedAt: at,
  })
  return [
    t(
      'tpl-001',
      'Diwali family feast',
      'festival',
      null,
      'Happy Diwali, {{first_name}}! Celebrate with {{business_name}} — family feasts are 15% off this week.',
    ),
    t(
      'tpl-002',
      'Eid Mubarak',
      'festival',
      null,
      'Eid Mubarak, {{first_name}}! Share the joy with a {{business_name}} sharing platter this Eid.',
    ),
    t(
      'tpl-003',
      'New menu item',
      'launch',
      null,
      '{{first_name}}, something new is cooking at {{business_name}}! Come try our latest broast today.',
    ),
    t(
      'tpl-004',
      'We miss you',
      'generic',
      'seg-lapsed',
      "We miss you, {{first_name}}! It's been a while — here's 10% off your next {{business_name}} order with code WELCOME10.",
    ),
    t(
      'tpl-005',
      'Thank you, regulars',
      'generic',
      'seg-vip',
      'Thank you for being one of our regulars, {{first_name}}. Your next drink at {{business_name}} is on us!',
    ),
  ]
}

let templateStore: CampaignTemplate[] = seedTemplates()

export function getTemplateStore(): CampaignTemplate[] {
  return templateStore
}

export function addTemplateToStore(template: CampaignTemplate): void {
  templateStore = [...templateStore, template]
}

export function replaceTemplateInStore(template: CampaignTemplate): void {
  templateStore = templateStore.map((t) => (t.id === template.id ? template : t))
}

export function removeTemplateFromStore(id: string): void {
  templateStore = templateStore.filter((t) => t.id !== id)
}
