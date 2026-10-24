import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { ProgramStatusBadge } from '@/features/programs/components/shared/ProgramParts'
import { TryVisitCard } from '@/features/programs/components/desktop/TryVisitCard'
import { STATUS_LABELS, type ProgramStatus } from '@/features/programs/types/program'
import { describeReward, describeTrigger } from '@/features/programs/utils/programRules'
import { cn } from '@/lib/utils'

const FILTERS: (ProgramStatus | 'all')[] = ['all', 'active', 'paused', 'draft', 'archived']

/**
 * Program List — Book 3 §2. Desktop: table, "New program" and "Try a
 * visit". Phone: read-only cards (building and publishing is Desktop
 * Admin only).
 */
export function ProgramListContent({ isDesktop }: { isDesktop: boolean }) {
  const [status, setStatus] = useState<ProgramStatus | 'all'>('all')
  const { data, isPending, isError, refetch } = usePrograms(status)
  const programs = data ?? []

  return (
    <div className={cn('flex flex-col gap-6', !isDesktop && 'p-4')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Programs</h1>
          <DemoDataBadge />
        </div>
        {isDesktop && (
          <Link to="/loyalty/programs/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
            <Plus className="size-4" />
            New program
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={status === f}
            onClick={() => setStatus(f)}
            className={buttonVariants({ variant: status === f ? 'default' : 'outline', size: 'sm' })}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-body font-medium">Couldn't load programs.</p>
          <button type="button" onClick={() => refetch()} className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Retry
          </button>
        </div>
      ) : isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="text-body font-medium">{status === 'all' ? 'No programs yet.' : `No ${STATUS_LABELS[status].toLowerCase()} programs.`}</p>
        </div>
      ) : isDesktop ? (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      {p.description && <p className="max-w-xs truncate text-caption text-muted-foreground">{p.description}</p>}
                    </TableCell>
                    <TableCell>
                      <ProgramStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>{p.segmentId === null ? 'All customers' : (p.segmentName ?? 'Segment deleted')}</TableCell>
                    <TableCell>{describeTrigger(p)}</TableCell>
                    <TableCell>{p.rewardName ?? describeReward(p.reward)}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/loyalty/programs/${p.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {programs.map((p) => (
            <Link key={p.id} to={`/loyalty/programs/${p.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-body font-medium">{p.name}</p>
                    <ProgramStatusBadge status={p.status} />
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    {describeTrigger(p)} · {p.rewardName ?? describeReward(p.reward)}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {p.segmentId === null ? 'All customers' : (p.segmentName ?? 'Segment deleted')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {isDesktop && <TryVisitCard />}
    </div>
  )
}
