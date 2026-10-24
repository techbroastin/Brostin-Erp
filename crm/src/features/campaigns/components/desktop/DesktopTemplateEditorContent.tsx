import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { MessagePreview, TokenHint } from '@/features/campaigns/components/shared/MessagePreview'
import { useDeleteTemplate, useSaveTemplate } from '@/features/campaigns/hooks/useTemplates'
import { templateSchema, type TemplateFormValues } from '@/features/campaigns/schemas/templateSchema'
import { OCCASION_LABELS, TEMPLATE_OCCASIONS, personalize } from '@/features/campaigns/utils/personalize'
import { useSegments } from '@/features/segments/hooks/useSegments'
import { useSettingsGeneral } from '@/features/settings/hooks/useSettingsGeneral'
import type { CampaignTemplate } from '@/features/campaigns/types/template'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const textareaClassName =
  'min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm'

const SAMPLE_FIRST_NAME = 'Priya'

/**
 * Template editor — create or edit one template, with a live preview
 * filled from a sample customer. Delete uses an inline confirm step.
 * Campaigns copy the text when created, so edits here never change
 * campaigns already made from this template.
 */
export function DesktopTemplateEditorContent({ template }: { template?: CampaignTemplate }) {
  const navigate = useNavigate()
  const isEdit = template !== undefined
  const saveTemplate = useSaveTemplate(template?.id)
  const deleteTemplate = useDeleteTemplate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const segments = useSegments()
  const general = useSettingsGeneral()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template
      ? { name: template.name, occasion: template.occasion, segmentId: template.segmentId ?? '', body: template.body }
      : { name: '', occasion: 'generic', segmentId: '', body: '' },
  })
  const body = useWatch({ control, name: 'body' })

  const onSubmit = handleSubmit((values) =>
    saveTemplate.mutate(
      { ...values, segmentId: values.segmentId || null },
      { onSuccess: () => navigate('/campaigns/templates') },
    ),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">{isEdit ? 'Edit template' : 'New template'}</h1>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="template-name" className="text-body-sm font-medium">
                Template name
              </label>
              <Input id="template-name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="template-occasion" className="text-body-sm font-medium">
                  Occasion
                </label>
                <select id="template-occasion" className={selectClassName} {...register('occasion')}>
                  {TEMPLATE_OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {OCCASION_LABELS[o]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="template-segment" className="text-body-sm font-medium">
                  Written for
                </label>
                <select id="template-segment" className={selectClassName} {...register('segmentId')}>
                  <option value="">Any segment</option>
                  {(segments.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="template-body" className="text-body-sm font-medium">
                Message
              </label>
              <textarea
                id="template-body"
                className={textareaClassName}
                aria-invalid={!!errors.body}
                {...register('body')}
              />
              {errors.body && <p className="text-caption text-destructive">{errors.body.message}</p>}
              <TokenHint />
            </div>

            {saveTemplate.isError && (
              <p className="text-caption text-destructive">
                {saveTemplate.error instanceof Error && saveTemplate.error.message.includes('already exists')
                  ? saveTemplate.error.message
                  : 'Could not save this template. Please try again.'}
              </p>
            )}
            {deleteTemplate.isError && (
              <p className="text-caption text-destructive">Could not delete this template. Please try again.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link to="/campaigns/templates" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Cancel
              </Link>
              {isEdit &&
                (confirmingDelete ? (
                  <>
                    <span className="text-body-sm text-muted-foreground">Delete this template?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      disabled={deleteTemplate.isPending}
                      onClick={() =>
                        deleteTemplate.mutate(template.id, { onSuccess: () => navigate('/campaigns/templates') })
                      }
                      className={buttonVariants({ variant: 'destructive', size: 'sm' })}
                    >
                      {deleteTemplate.isPending ? 'Deleting…' : 'Delete'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    Delete template
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saveTemplate.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {saveTemplate.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create template'}
            </button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagePreview
              text={personalize(body ?? '', {
                first_name: SAMPLE_FIRST_NAME,
                business_name: general.data?.businessName ?? 'Broastin',
              })}
              caption={`Shown for a sample customer named ${SAMPLE_FIRST_NAME}.`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
