import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useTemplate } from '@/features/campaigns/hooks/useTemplates'
import { CampaignDesktopOnlyNotice } from '@/features/campaigns/components/shared/CampaignDesktopOnlyNotice'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { DesktopTemplateListContent } from '@/features/campaigns/components/desktop/DesktopTemplateListContent'
import { DesktopTemplateEditorContent } from '@/features/campaigns/components/desktop/DesktopTemplateEditorContent'

/** /campaigns/templates — Template Library. Desktop Admin only. */
export function TemplatesScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopTemplateListContent /> : <CampaignDesktopOnlyNotice />
}

/** /campaigns/templates/new. Desktop Admin only. */
export function CreateTemplateScreen() {
  const isDesktop = useIsDesktopViewport()
  return isDesktop ? <DesktopTemplateEditorContent /> : <CampaignDesktopOnlyNotice />
}

/** /campaigns/templates/:templateId — edit. Desktop Admin only. */
export function EditTemplateScreen() {
  const { templateId } = useParams<{ templateId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: template, isPending, isError, refetch } = useTemplate(templateId ?? '')

  if (!isDesktop) return <CampaignDesktopOnlyNotice />
  if (isError) {
    return (
      <CampaignErrorState
        title="Couldn't load this template"
        message="Something went wrong. Please try again."
        onRetry={() => refetch()}
      />
    )
  }
  if (isPending) return <Skeleton className="h-64 w-full" />
  if (!template) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-body font-medium">Template not found.</p>
        <p className="text-body-sm text-muted-foreground">It doesn't exist or may have been deleted.</p>
      </div>
    )
  }
  return <DesktopTemplateEditorContent key={template.id} template={template} />
}
