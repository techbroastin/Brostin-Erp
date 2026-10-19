import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SettingsErrorState } from '@/features/settings/components/shared/SettingsErrorState'
import {
  useNotificationPreferences,
  notificationPreferencesQueryKey,
} from '@/features/settings/hooks/useNotificationPreferences'
import { updateNotificationPreference } from '@/features/settings/services/settingsService'

/**
 * Desktop Notifications — mock preference toggles only, session-only
 * state. No real notification delivery exists or is implied.
 */
export function DesktopNotificationsSettingsContent() {
  const queryClient = useQueryClient()
  const { data: preferences, isPending, isError, refetch } = useNotificationPreferences()

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateNotificationPreference(id, enabled),
    onSuccess: (updated) => {
      queryClient.setQueryData(notificationPreferencesQueryKey, updated)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Notifications</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <SettingsErrorState message="Couldn't load notification preferences." onRetry={() => refetch()} />
      ) : (
        <Card className="max-w-md">
          <CardContent className="flex flex-col gap-1">
            {isPending ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : (
              <>
                {(preferences ?? []).map((pref) => (
                  <label
                    key={pref.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-body-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      className="accent-brand-primary"
                      checked={pref.enabled}
                      onChange={(e) =>
                        toggleMutation.mutate({ id: pref.id, enabled: e.target.checked })
                      }
                    />
                    {pref.label}
                  </label>
                ))}
                <p className="mt-2 text-caption text-muted-foreground">
                  Mock preferences only — no real notification is ever sent.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
