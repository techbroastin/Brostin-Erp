import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SettingsErrorState } from '@/features/settings/components/shared/SettingsErrorState'
import { useSettingsGeneral, settingsGeneralQueryKey } from '@/features/settings/hooks/useSettingsGeneral'
import { updateGeneralSettings } from '@/features/settings/services/settingsService'
import {
  generalSettingsSchema,
  type GeneralSettingsFormValues,
} from '@/features/settings/schemas/settingsSchema'

/** Desktop General Settings — mock-editable business/profile fields, RHF + Zod validation. */
export function DesktopGeneralSettingsContent() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useSettingsGeneral()
  const [savedMessage, setSavedMessage] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { businessName: '', contactEmail: '', contactPhone: '' },
  })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const updateMutation = useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsGeneralQueryKey, updated)
      setSavedMessage(true)
    },
  })

  const onSubmit = handleSubmit((values) => {
    setSavedMessage(false)
    updateMutation.mutate(values)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">General</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <SettingsErrorState message="Couldn't load general settings." onRetry={() => refetch()} />
      ) : isPending ? (
        <Card className="max-w-md">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="general-business-name" className="text-body-sm font-medium">
                Business name
              </label>
              <Input
                id="general-business-name"
                {...register('businessName')}
                aria-invalid={!!errors.businessName}
              />
              {errors.businessName && (
                <p className="text-caption text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="general-contact-email" className="text-body-sm font-medium">
                Contact email
              </label>
              <Input
                id="general-contact-email"
                type="email"
                {...register('contactEmail')}
                aria-invalid={!!errors.contactEmail}
              />
              {errors.contactEmail && (
                <p className="text-caption text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="general-contact-phone" className="text-body-sm font-medium">
                Contact phone
              </label>
              <Input
                id="general-contact-phone"
                {...register('contactPhone')}
                aria-invalid={!!errors.contactPhone}
              />
              {errors.contactPhone && (
                <p className="text-caption text-destructive">{errors.contactPhone.message}</p>
              )}
            </div>

            {savedMessage && <p className="text-caption text-success">Saved (mock data only).</p>}
          </CardContent>
          <CardFooter>
            <button
              type="button"
              onClick={onSubmit}
              disabled={updateMutation.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
