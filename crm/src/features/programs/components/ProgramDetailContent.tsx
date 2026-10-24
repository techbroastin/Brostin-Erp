import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ProgramRuleSummary, ProgramStatusBadge } from '@/features/programs/components/shared/ProgramParts'
import { usePrograms, useProgramPerformance, useProgramProblems, useSetProgramStatus } from '@/features/programs/hooks/usePrograms'
import type { ProgramStatus, ProgramSummary } from '@/features/programs/types/program'
import { cn } from '@/lib/utils'

/**
 * Program Detail — Book 3 §2. Desktop gets the lifecycle actions
 * (Publish, Pause, Resume, Archive — with an inline confirm for the
 * final Archive) and the publish checklist; the phone view is read-only.
 * Per-program results need real visits from the POS/QR feed.
 */
export function ProgramDetailContent({ program, isDesktop }: { program: ProgramSummary; isDesktop: boolean }) {
  const all = usePrograms('all')
  const problems = useProgramProblems(program.id)
  const setStatus = useSetProgramStatus(program.id)
  const [confirmArchive, setConfirmArchive] = useState(false)

  const canPublish = problems.data?.length === 0
  const go = (status: ProgramStatus) => setStatus.mutate(status, { onSettled: () => setConfirmArchive(false) })
  const editable = program.status === 'draft' || program.status === 'paused'

  return (
    <div className={cn('flex flex-col gap-6', !isDesktop && 'p-4')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{program.name}</h1>
          <ProgramStatusBadge status={program.status} />
          {isDesktop && <DemoDataBadge />}
        </div>
        {isDesktop && program.status !== 'archived' && (
          <div className="flex items-center gap-2">
            {editable && (
              <Link to={`/loyalty/programs/${program.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Edit
              </Link>
            )}
            {editable &&
              (confirmArchive ? (
                <>
                  <span className="text-body-sm text-muted-foreground">Archive for good?</span>
                  <button type="button" onClick={() => setConfirmArchive(false)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Keep
                  </button>
                  <button type="button" onClick={() => go('archived')} className={buttonVariants({ variant: 'destructive', size: 'sm' })}>
                    Archive
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmArchive(true)} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  Archive
                </button>
              ))}
            {program.status === 'active' ? (
              <button type="button" onClick={() => go('paused')} disabled={setStatus.isPending} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go('active')}
                disabled={setStatus.isPending || !canPublish}
                title={!canPublish ? 'Fix the items in "Before it can go live" first' : undefined}
                className={buttonVariants({ variant: 'default', size: 'sm' })}
              >
                {program.status === 'paused' ? 'Resume' : 'Publish'}
              </button>
            )}
          </div>
        )}
      </div>

      {setStatus.isError && (
        <p className="text-body-sm text-destructive">
          {setStatus.error instanceof Error ? setStatus.error.message : 'Could not update this program.'}
        </p>
      )}

      {program.description && <p className="max-w-2xl text-body-sm text-muted-foreground">{program.description}</p>}

      {isDesktop && editable && problems.data && (
        <div
          className={cn(
            'max-w-2xl rounded-lg border px-3 py-2 text-body-sm',
            problems.data.length > 0 ? 'border-warning/40 bg-warning/10' : 'border-success/40 bg-success/10',
          )}
        >
          {problems.data.length > 0 ? (
            <>
              <p className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="size-4" /> Before it can go live
              </p>
              <ul className="mt-1 list-disc pl-6">
                {problems.data.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" /> Ready to {program.status === 'paused' ? 'resume' : 'publish'}.
            </p>
          )}
        </div>
      )}

      <div className={cn('grid gap-4', isDesktop && 'grid-cols-[minmax(0,2fr)_minmax(0,3fr)]')}>
        <Card>
          <CardHeader>
            <CardSectionHeading>Rule</CardSectionHeading>
          </CardHeader>
          <CardContent>
            <ProgramRuleSummary program={program} allPrograms={all.data ?? []} />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardSectionHeading>Message to the customer</CardSectionHeading>
            </CardHeader>
            <CardContent className="text-body-sm whitespace-pre-wrap">"{program.message.body}"</CardContent>
          </Card>
          <ProgramResultsCard programId={program.id} />
        </div>
      </div>
    </div>
  )
}

/** Book 3 §2 Program Detail performance — from the loyalty points ledger (demo data until the POS/QR feed). */
function ProgramResultsCard({ programId }: { programId: string }) {
  const { data, isPending, isError, refetch } = useProgramPerformance(programId)

  const stats = data
    ? [
        { label: 'Times applied', value: String(data.timesApplied) },
        { label: 'Customers rewarded', value: String(data.customersRewarded) },
        { label: 'Points given', value: String(data.pointsAwarded) },
        {
          label: 'Last applied',
          value: data.lastAppliedAt
            ? new Date(data.lastAppliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : '—',
        },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>Results</CardSectionHeading>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isError ? (
          <button type="button" onClick={() => refetch()} className="self-start text-body-sm underline">
            Couldn't load results — retry
          </button>
        ) : isPending ? (
          <Skeleton className="h-16" />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-caption text-muted-foreground">{s.label}</dt>
                  <dd className="text-h3 font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
            {data?.timesApplied === 0 && (
              <p className="text-body-sm text-muted-foreground">This program hasn't rewarded anyone yet.</p>
            )}
            <p className="text-caption text-muted-foreground">
              From the loyalty points ledger (demo data until real orders arrive from the POS/QR feed).
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
