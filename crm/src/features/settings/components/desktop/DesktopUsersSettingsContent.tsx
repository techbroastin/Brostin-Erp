import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SettingsErrorState } from '@/features/settings/components/shared/SettingsErrorState'
import { useSettingsUsers, settingsUsersQueryKey } from '@/features/settings/hooks/useSettingsUsers'
import {
  addSettingsUser,
  removeSettingsUser,
  updateSettingsUserRole,
} from '@/features/settings/services/settingsService'
import { addUserSchema, type AddUserFormValues } from '@/features/settings/schemas/settingsSchema'
import { ROLE_LABELS, type SettingsUserRole } from '@/features/settings/types/settings'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Desktop Users Settings — mock list, add, change role, remove. No real
 * account creation, invitations, or authentication. Every change is
 * written to the Audit Log. The last Owner can't be removed or demoted.
 * Remove is immediate (no confirmation step) since this only affects
 * session-only mock state.
 */
export function DesktopUsersSettingsContent() {
  const queryClient = useQueryClient()
  const { data: users, isPending, isError, refetch } = useSettingsUsers()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { name: '', email: '', role: 'manager' },
  })

  const addMutation = useMutation({
    mutationFn: addSettingsUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsUsersQueryKey })
      reset()
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeSettingsUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsUsersQueryKey })
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: SettingsUserRole }) => updateSettingsUserRole(id, role),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsUsersQueryKey })
    },
  })

  const actionError = [roleMutation.error, removeMutation.error].find((e) => e instanceof Error)

  const onSubmit = handleSubmit((values) => {
    addMutation.mutate(values)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Users</h1>
        <DemoDataBadge />
      </div>

      {isError ? (
        <SettingsErrorState message="Couldn't load users." onRetry={() => refetch()} />
      ) : (
        <>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Add user</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-user-name" className="text-body-sm font-medium">
                    Name
                  </label>
                  <Input id="add-user-name" {...register('name')} aria-invalid={!!errors.name} />
                  {errors.name && <p className="text-caption text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-user-email" className="text-body-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="add-user-email"
                    type="email"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-caption text-destructive">{errors.email.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-user-role" className="text-body-sm font-medium">
                    Role
                  </label>
                  <select id="add-user-role" className={selectClassName} {...register('role')}>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={addMutation.isPending}
                  className={buttonVariants({ variant: 'default', size: 'sm' })}
                >
                  {addMutation.isPending ? 'Adding…' : 'Add user'}
                </button>
              </div>
            </CardContent>
          </Card>

          {actionError && (
            <p className="text-body-sm text-destructive">
              {actionError.message.includes('Owner') ? actionError.message : 'Could not update this user. Please try again.'}
            </p>
          )}

          <Card>
            <CardContent>
              {isPending ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : users && users.length === 0 ? (
                <p className="py-8 text-center text-body-sm text-muted-foreground">No users yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users ?? []).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <select
                            aria-label={`Role for ${user.name}`}
                            className={selectClassName}
                            value={user.role}
                            disabled={roleMutation.isPending}
                            onChange={(e) => {
                              removeMutation.reset()
                              roleMutation.mutate({ id: user.id, role: e.target.value as SettingsUserRole })
                            }}
                          >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => {
                              roleMutation.reset()
                              removeMutation.mutate(user.id)
                            }}
                            disabled={removeMutation.isPending}
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            Remove
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
