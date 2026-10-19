import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useAddPosConnection } from '@/features/pos-integrations/hooks/useAddPosConnection'
import {
  addPosConnectionSchema,
  type AddPosConnectionFormValues,
} from '@/features/pos-integrations/schemas/posIntegrationSchema'
import {
  VENDOR_LABELS,
  AUTH_METHOD_LABELS,
  type PosVendor,
  type PosAuthMethod,
  type PosSyncMode,
} from '@/features/pos-integrations/types/posIntegration'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const STEPS = ['Vendor', 'Authentication', 'Sync', 'Review'] as const
type Step = 0 | 1 | 2 | 3

/**
 * Add Connection wizard — docs/IMPLEMENTATION_PLAN.md §21's adapter
 * boundary, generalized per the approved Phase 18b multi-vendor scope.
 * Mirrors DesktopCreateWorkflowContent's step-wizard pattern exactly.
 * Submitting never contacts any real vendor — it only creates a
 * 'pending' connection in the in-memory mock store (see
 * services/posIntegrationsService.ts). Verifying it is a separate,
 * explicit Test Connection action on the connection's detail page.
 */
export function DesktopAddPosConnectionContent() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<AddPosConnectionFormValues>({
    resolver: zodResolver(addPosConnectionSchema),
    defaultValues: {
      vendor: 'manageme',
      label: '',
      authMethod: 'api_key',
      syncMode: 'polling',
      pollingIntervalMinutes: 30,
    },
  })

  const vendor = useWatch({ control, name: 'vendor' })
  const label = useWatch({ control, name: 'label' })
  const authMethod = useWatch({ control, name: 'authMethod' })
  const syncMode = useWatch({ control, name: 'syncMode' })
  const pollingIntervalMinutes = useWatch({ control, name: 'pollingIntervalMinutes' })

  const addConnection = useAddPosConnection()

  const STEP_FIELDS: Record<Step, (keyof AddPosConnectionFormValues)[]> = {
    0: ['vendor', 'label'],
    1: ['authMethod'],
    2: ['syncMode', 'pollingIntervalMinutes'],
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
    addConnection.mutate(
      {
        vendor: values.vendor as PosVendor,
        label: values.label,
        authMethod: values.authMethod as PosAuthMethod,
        syncMode: values.syncMode as PosSyncMode,
        pollingIntervalMinutes: values.syncMode === 'polling' ? values.pollingIntervalMinutes : null,
      },
      {
        onSuccess: (connection) => navigate(`/settings/integrations/${connection.id}`),
      },
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Add Connection</h1>
        <DemoDataBadge />
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((stepLabel, i) => (
          <div key={stepLabel} className="flex items-center gap-2">
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
              {stepLabel}
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
                <label htmlFor="pos-vendor" className="text-body-sm font-medium">
                  POS vendor
                </label>
                <select id="pos-vendor" className={selectClassName} {...register('vendor')}>
                  {Object.entries(VENDOR_LABELS).map(([value, vendorLabel]) => (
                    <option key={value} value={value}>
                      {vendorLabel}
                    </option>
                  ))}
                </select>
                <p className="text-caption text-muted-foreground">
                  Petpooja is a mock-phase placeholder — no real Petpooja integration exists yet.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pos-label" className="text-body-sm font-medium">
                  Connection label
                </label>
                <Input
                  id="pos-label"
                  placeholder="e.g. Main Branch ManageMe"
                  {...register('label')}
                  aria-invalid={!!errors.label}
                />
                {errors.label && <p className="text-caption text-destructive">{errors.label.message}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pos-auth-method" className="text-body-sm font-medium">
                  Authentication method
                </label>
                <select id="pos-auth-method" className={selectClassName} {...register('authMethod')}>
                  {Object.entries(AUTH_METHOD_LABELS).map(([value, authLabel]) => (
                    <option key={value} value={value}>
                      {authLabel}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-caption text-muted-foreground">
                No credential fields are collected here — real authentication is not implemented
                until verified vendor API documentation is available. Only the chosen method is
                recorded on the mock connection.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium">Sync mode</span>
                <select id="pos-sync-mode" className={selectClassName} {...register('syncMode')}>
                  <option value="polling">Polling</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              {syncMode === 'polling' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pos-polling-interval" className="text-body-sm font-medium">
                    Polling interval (minutes)
                  </label>
                  <Input
                    id="pos-polling-interval"
                    type="number"
                    min={1}
                    aria-invalid={!!errors.pollingIntervalMinutes}
                    {...register('pollingIntervalMinutes', { valueAsNumber: true })}
                  />
                  {errors.pollingIntervalMinutes && (
                    <p className="text-caption text-destructive">{errors.pollingIntervalMinutes.message}</p>
                  )}
                </div>
              )}

              <p className="text-caption text-muted-foreground">
                Mock configuration only — no scheduler or webhook receiver exists, and nothing is
                actually polled or triggered.
              </p>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor</span>
                <span className="font-medium">{VENDOR_LABELS[vendor as PosVendor]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Label</span>
                <span className="font-medium">{label || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authentication</span>
                <span className="font-medium">{AUTH_METHOD_LABELS[authMethod as PosAuthMethod]}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Sync</span>
                <span className="font-medium">
                  {syncMode === 'polling' ? `Polling every ${pollingIntervalMinutes ?? 0} min` : 'Webhook'}
                </span>
              </div>
              <p className="text-caption text-muted-foreground">
                This connection will be created as Pending. Use Test Connection on its detail page
                afterward to simulate verifying it — no real vendor is ever contacted.
              </p>
              {addConnection.isError && (
                <p className="text-caption text-destructive">
                  Could not create this connection. Please try again.
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
              disabled={addConnection.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {addConnection.isPending ? 'Creating…' : 'Add Connection'}
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
