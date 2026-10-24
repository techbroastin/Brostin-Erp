import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useSignOut } from '@/features/auth/hooks/useAuth'
import { SettingsErrorState } from '@/features/settings/components/shared/SettingsErrorState'
import { useSettingsGeneral, settingsGeneralQueryKey } from '@/features/settings/hooks/useSettingsGeneral'
import {
  useNotificationPreferences,
  notificationPreferencesQueryKey,
} from '@/features/settings/hooks/useNotificationPreferences'
import { updateGeneralSettings, updateNotificationPreference } from '@/features/settings/services/settingsService'
import {
  generalSettingsSchema,
  type GeneralSettingsFormValues,
} from '@/features/settings/schemas/settingsSchema'

/**
 * Mobile Settings — the one simplified screen for every /settings/*
 * route, per docs/MOBILE_UI_SPEC.md §22's example groups (Account,
 * Notifications, Preferences, App, Logout). Account and Notifications
 * reuse the exact same shared mock data/service as Desktop Admin;
 * Preferences and App are static placeholders — nothing is invented
 * for groups with no corresponding data. Logout signs out (features/auth).
 */
export function MobileSettingsContent() {
  const queryClient = useQueryClient()
  const signOut = useSignOut()

  const { data: general, isPending: generalPending, isError: generalError, refetch: refetchGeneral } =
    useSettingsGeneral()
  const {
    data: preferences,
    isPending: notificationsPending,
    isError: notificationsError,
    refetch: refetchNotifications,
  } = useNotificationPreferences()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { businessName: '', contactEmail: '', contactPhone: '', publicReviewUrl: '' },
  })

  useEffect(() => {
    if (general) reset({ ...general, publicReviewUrl: general.publicReviewUrl ?? '' })
  }, [general, reset])

  const updateGeneralMutation = useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (updated) => queryClient.setQueryData(settingsGeneralQueryKey, updated),
  })

  const toggleNotificationMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateNotificationPreference(id, enabled),
    onSuccess: (updated) => queryClient.setQueryData(notificationPreferencesQueryKey, updated),
  })

  const onSubmitGeneral = handleSubmit((values) =>
    updateGeneralMutation.mutate({ ...values, publicReviewUrl: values.publicReviewUrl || null }),
  )

  return (
    <div className="flex flex-col gap-6 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Settings</h2>

      <section className="flex flex-col gap-3">
        <h3 className="text-body-sm font-semibold text-muted-foreground">Account</h3>
        {generalError ? (
          <SettingsErrorState message="Couldn't load account settings." onRetry={() => refetchGeneral()} />
        ) : generalPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mobile-business-name" className="text-body-sm font-medium">
                Business name
              </label>
              <Input id="mobile-business-name" {...register('businessName')} aria-invalid={!!errors.businessName} />
              {errors.businessName && (
                <p className="text-caption text-destructive">{errors.businessName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mobile-contact-email" className="text-body-sm font-medium">
                Contact email
              </label>
              <Input
                id="mobile-contact-email"
                type="email"
                {...register('contactEmail')}
                aria-invalid={!!errors.contactEmail}
              />
              {errors.contactEmail && (
                <p className="text-caption text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onSubmitGeneral}
              disabled={updateGeneralMutation.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {updateGeneralMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-body-sm font-semibold text-muted-foreground">Notifications</h3>
        {notificationsError ? (
          <SettingsErrorState
            message="Couldn't load notification preferences."
            onRetry={() => refetchNotifications()}
          />
        ) : notificationsPending ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <div className="flex flex-col gap-1">
            {(preferences ?? []).map((pref) => (
              <label key={pref.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm">
                <input
                  type="checkbox"
                  className="accent-brand-primary"
                  checked={pref.enabled}
                  onChange={(e) =>
                    toggleNotificationMutation.mutate({ id: pref.id, enabled: e.target.checked })
                  }
                />
                {pref.label}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-body-sm font-semibold text-muted-foreground">Preferences</h3>
        <p className="text-body-sm text-muted-foreground">No preferences configured yet</p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-body-sm font-semibold text-muted-foreground">App</h3>
        <p className="text-body-sm text-muted-foreground">
          App settings will be available in a future update
        </p>
      </section>

      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-body font-medium text-foreground hover:bg-muted"
        >
          <LogOut className="size-5 shrink-0" />
          Logout
        </button>
      </section>
    </div>
  )
}
