import type {
  CampaignTemplate,
  CampaignTemplateSummary,
  TemplateInput,
  TemplateListParams,
} from '@/features/campaigns/types/template'
import {
  getTemplateStore,
  addTemplateToStore,
  replaceTemplateInStore,
  removeTemplateFromStore,
} from '@/features/campaigns/mock/templates.mock'
import { listSegments } from '@/features/segments/services/segmentService'
import { recordAudit } from '@/features/audit/services/auditService'
import { OCCASION_LABELS } from '@/features/campaigns/utils/personalize'

/** Resolves segment names; the Segments service also supplies the simulated latency. */
async function withSegmentNames(templates: CampaignTemplate[]): Promise<CampaignTemplateSummary[]> {
  const names = new Map((await listSegments()).map((s) => [s.id, s.name]))
  return templates.map((t) => ({ ...t, segmentName: t.segmentId ? (names.get(t.segmentId) ?? null) : null }))
}

export async function listTemplates(params: TemplateListParams): Promise<CampaignTemplateSummary[]> {
  const filtered = getTemplateStore().filter((t) => params.occasion === 'all' || t.occasion === params.occasion)
  return (await withSegmentNames(filtered)).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getTemplate(id: string): Promise<CampaignTemplateSummary | null> {
  const template = getTemplateStore().find((t) => t.id === id)
  if (!template) {
    await listSegments()
    return null
  }
  const [summary] = await withSegmentNames([template])
  return summary
}

function assertUniqueName(name: string, exceptId?: string) {
  const taken = getTemplateStore().some(
    (t) => t.id !== exceptId && t.name.trim().toLowerCase() === name.trim().toLowerCase(),
  )
  if (taken) throw new Error('A template with this name already exists.')
}

export async function createTemplate(input: TemplateInput): Promise<CampaignTemplate> {
  await listSegments()
  assertUniqueName(input.name)
  const now = new Date().toISOString()
  const template: CampaignTemplate = { id: `tpl-${Date.now()}`, ...input, name: input.name.trim(), createdAt: now, updatedAt: now }
  addTemplateToStore(template)
  recordAudit({
    category: 'marketing',
    action: 'Created template',
    target: { type: 'template', id: template.id, label: template.name, href: `/campaigns/templates/${template.id}` },
    changes: [{ field: 'Occasion', from: '—', to: OCCASION_LABELS[template.occasion] }],
  })
  return template
}

export async function updateTemplate(id: string, input: TemplateInput): Promise<CampaignTemplate> {
  await listSegments()
  const existing = getTemplateStore().find((t) => t.id === id)
  if (!existing) throw new Error('Template not found.')
  assertUniqueName(input.name, id)
  const updated: CampaignTemplate = { ...existing, ...input, name: input.name.trim(), updatedAt: new Date().toISOString() }
  replaceTemplateInStore(updated)
  const changes = [
    { field: 'Name', from: existing.name, to: updated.name },
    { field: 'Occasion', from: OCCASION_LABELS[existing.occasion], to: OCCASION_LABELS[updated.occasion] },
    { field: 'Message', from: existing.body, to: updated.body },
  ].filter((c) => c.from !== c.to)
  recordAudit({
    category: 'marketing',
    action: 'Edited template',
    target: { type: 'template', id, label: updated.name, href: `/campaigns/templates/${id}` },
    changes,
  })
  return updated
}

/** Campaigns copy a template's text when created, so deleting one never changes existing campaigns. */
export async function deleteTemplate(id: string): Promise<void> {
  await listSegments()
  const existing = getTemplateStore().find((t) => t.id === id)
  if (!existing) return
  removeTemplateFromStore(id)
  recordAudit({
    category: 'marketing',
    action: 'Deleted template',
    target: { type: 'template', id, label: existing.name },
    changes: [],
  })
}
