import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { BrandMark } from '@/components/shared/BrandMark'
import { useCurrentUser, useSignIn } from '@/features/auth/hooks/useAuth'
import { useSettingsUsers } from '@/features/settings/hooks/useSettingsUsers'
import { ROLE_LABELS } from '@/features/settings/types/settings'
import { DEMO_PASSWORD_HINT } from '@/features/auth/services/authService'

const signInSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

type SignInValues = z.infer<typeof signInSchema>

/** Only same-app paths, so a crafted ?next= link can't send someone to another site. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}

/**
 * Sign-in — docs/IMPLEMENTATION_PLAN.md §23 (email + password) and the
 * "Auth Layout" of docs/FRONTEND_ARCHITECTURE.md: shell-less, one
 * centred card that works from a 320px phone up to desktop. Demo mode
 * lists the Settings → Users accounts so each Book 3 §14 role can be
 * tried; Supabase Auth replaces this later without changing the form.
 */
export function SignInScreen() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const signIn = useSignIn()
  const users = useSettingsUsers()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } })

  if (user) return <Navigate to={next} replace />

  const onSubmit = handleSubmit((values) => signIn.mutate(values, { onSuccess: () => navigate(next, { replace: true }) }))

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex justify-center rounded-2xl bg-gradient-to-br from-brand-primary-deep to-brand-primary px-4 py-5 text-white">
          <BrandMark withLogo subtitle="Growth OS" nameClassName="text-h3 font-extrabold text-brand-accent" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="text-section-title font-semibold">Sign in</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sign-in-email" className="text-body-sm font-medium">
                  Email
                </label>
                <Input
                  id="sign-in-email"
                  type="email"
                  autoComplete="username"
                  className="h-11"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-caption text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sign-in-password" className="text-body-sm font-medium">
                  Password
                </label>
                <Input
                  id="sign-in-password"
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <p className="text-caption text-destructive">{errors.password.message}</p>}
              </div>

              {signIn.isError && (
                <p role="alert" className="text-body-sm text-destructive">
                  {signIn.error instanceof Error ? signIn.error.message : 'Could not sign in. Please try again.'}
                </p>
              )}

              <button
                type="submit"
                disabled={signIn.isPending}
                className={buttonVariants({ variant: 'default', className: 'h-11 w-full' })}
              >
                {signIn.isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 text-body-sm">
            <p className="font-medium">Demo accounts</p>
            <p className="text-muted-foreground">
              Every user in Settings → Users can sign in with the password{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">{DEMO_PASSWORD_HINT}</code>. Real accounts
              arrive with Supabase sign-in.
            </p>
            <ul className="flex flex-col gap-1">
              {(users.data ?? []).map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('email', u.email, { shouldValidate: true })
                      setValue('password', DEMO_PASSWORD_HINT, { shouldValidate: true })
                    }}
                    className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{u.name}</span>
                      <span className="block truncate text-caption text-muted-foreground">{u.email}</span>
                    </span>
                    <span className="shrink-0 text-caption text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
