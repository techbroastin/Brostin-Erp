import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { listCustomers } from '@/features/customers/services/customerService'
import { useCreateCampaign } from '@/features/campaigns/hooks/useCreateCampaign'
import { campaignSchema, type CampaignFormValues } from '@/features/campaigns/schemas/campaignSchema'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'

const ALL_CUSTOMERS_PAGE_SIZE = 1000

const textareaClassName =
  'min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm'

const STEPS = ['Details', 'Audience', 'Content', 'Review'] as const
type Step = 0 | 1 | 2 | 3

/**
 * Create Campaign — docs/DESKTOP_UI_SPEC.md §11/§15: a structured,
 * multi-step flow (details → audience → content → review) on a
 * dedicated screen, not a dialog. Validation uses React Hook Form +
 * Zod per docs/FRONTEND_ARCHITECTURE.md §19 (already-installed, first
 * actual use in this codebase). No new shadcn UI primitive is added —
 * audience selection uses plain checkboxes and message content uses a
 * plain styled <textarea>, matching the existing native-<select>
 * precedent in DesktopOrderListContent.tsx.
 */
export function DesktopCreateCampaignContent() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const [audienceSearch, setAudienceSearch] = useState('')
  const debouncedAudienceSearch = useDebouncedValue(audienceSearch)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { name: '', message: '', audienceCustomerIds: [], scheduledAt: null },
  })

  const name = useWatch({ control, name: 'name' })
  const message = useWatch({ control, name: 'message' })
  const audienceCustomerIds = useWatch({ control, name: 'audienceCustomerIds' })
  const scheduledAtInput = useWatch({ control, name: 'scheduledAt' })

  const { data: customersResult, isPending: customersPending } = useQuery({
    queryKey: ['customers', 'list', { search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' }],
    queryFn: () =>
      listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' }),
  })

  const allCustomers = customersResult?.items ?? []
  const visibleCustomers = debouncedAudienceSearch
    ? allCustomers.filter((c) => c.name.toLowerCase().includes(debouncedAudienceSearch.toLowerCase()))
    : allCustomers

  const createCampaign = useCreateCampaign()

  const toggleCustomer = (id: string) => {
    const current = audienceCustomerIds ?? []
    setValue(
      'audienceCustomerIds',
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldValidate: true },
    )
  }

  const STEP_FIELDS: Record<Step, (keyof CampaignFormValues)[]> = {
    0: ['name'],
    1: ['audienceCustomerIds'],
    2: ['message'],
    3: [],
  }

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid && step < 3) setStep((step + 1) as Step)
  }

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step)
  }

  const onSubmit = handleSubmit((values) => {
    createCampaign.mutate(
      {
        name: values.name,
        message: values.message,
        audienceCustomerIds: values.audienceCustomerIds,
        scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : null,
      },
      {
        onSuccess: (campaign) => navigate(`/campaigns/${campaign.id}`),
      },
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Create Campaign</h1>
        <DemoDataBadge />
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-caption font-medium',
                i === step
                  ? 'bg-brand-primary text-white'
                  : i < step
                    ? 'bg-brand-primary-soft text-brand-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-body-sm', i === step ? 'font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="campaign-name" className="text-body-sm font-medium">
                  Campaign name
                </label>
                <Input id="campaign-name" {...register('name')} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="campaign-scheduled-at" className="text-body-sm font-medium">
                  Schedule for (optional)
                </label>
                <Input id="campaign-scheduled-at" type="datetime-local" {...register('scheduledAt')} />
                <p className="text-caption text-muted-foreground">
                  Leave blank to save as a draft. This never dispatches an actual message.
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <SearchInput
                id="audience-search"
                label="Search customers"
                placeholder="Search customers…"
                value={audienceSearch}
                onChange={setAudienceSearch}
              />
              {errors.audienceCustomerIds && (
                <p className="text-caption text-destructive">{errors.audienceCustomerIds.message}</p>
              )}
              <p className="text-caption text-muted-foreground">
                {audienceCustomerIds?.length ?? 0} selected — picked individually; no customer
                segment/tag model exists yet.
              </p>
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-md border border-border p-1">
                {customersPending ? (
                  <p className="p-2 text-body-sm text-muted-foreground">Loading customers…</p>
                ) : visibleCustomers.length === 0 ? (
                  <p className="p-2 text-body-sm text-muted-foreground">No customers match your search.</p>
                ) : (
                  visibleCustomers.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        className="accent-brand-primary"
                        checked={(audienceCustomerIds ?? []).includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                      />
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground">{c.phone}</span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campaign-message" className="text-body-sm font-medium">
                Message content
              </label>
              <textarea
                id="campaign-message"
                className={textareaClassName}
                aria-invalid={!!errors.message}
                {...register('message')}
              />
              {errors.message && <p className="text-caption text-destructive">{errors.message.message}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience</span>
                <span className="font-medium">{audienceCustomerIds?.length ?? 0} customers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled for</span>
                <span className="font-medium">
                  {scheduledAtInput
                    ? new Date(scheduledAtInput).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Not scheduled (saves as draft)'}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-border pt-2">
                <span className="text-muted-foreground">Message</span>
                <p className="whitespace-pre-wrap">{message || '—'}</p>
              </div>
              {createCampaign.isError && (
                <p className="text-caption text-destructive">
                  Could not create this campaign. Please try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={goNext} className={buttonVariants({ variant: 'default', size: 'sm' })}>
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={createCampaign.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {createCampaign.isPending ? 'Creating…' : 'Create Campaign'}
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
