import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { useCampaigns } from '@/features/campaigns/hooks/useCampaigns'
import { dateKey, groupByDay, monthGrid } from '@/features/campaigns/utils/calendar'
import type { CampaignSummary } from '@/features/campaigns/types/campaign'
import { cn } from '@/lib/utils'

const ALL = { search: '', page: 1, pageSize: 1000, sortBy: 'createdAt' } as const
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CHIP_STYLE: Record<CampaignSummary['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-warning/15 text-foreground',
  sent: 'bg-success/15 text-foreground',
}

/**
 * Campaign Calendar — Book 3 §4. Month view of sent and scheduled
 * campaigns (yearly ones marked with a repeat icon), with unscheduled
 * drafts listed beside it. Clicking an empty upcoming day plans a
 * campaign for that date.
 */
export function DesktopCampaignCalendarContent() {
  const [today] = useState(() => new Date())
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const { data, isPending, isError, refetch } = useCampaigns(ALL)

  const campaigns = data?.items ?? []
  const byDay = groupByDay(campaigns)
  const drafts = campaigns.filter((c) => !c.scheduledAt && !c.sentAt)
  const weeks = monthGrid(month.year, month.month)
  const todayKey = dateKey(today)
  const monthLabel = new Date(month.year, month.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const shift = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Calendar</h1>
          <DemoDataBadge />
        </div>
        <Link to="/campaigns/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
          <Plus className="size-4" />
          Create Campaign
        </Link>
      </div>

      {isError ? (
        <CampaignErrorState message="Something went wrong. Please try again." onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_16rem] items-start gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-section-title font-semibold">{monthLabel}</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shift(-1)}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMonth({ year: today.getFullYear(), month: today.getMonth() })}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Today
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => shift(1)}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-t border-l border-border text-body-sm" role="grid" aria-label={monthLabel}>
                {WEEKDAYS.map((d) => (
                  <div key={d} role="columnheader" className="border-r border-b border-border bg-muted/40 px-2 py-1.5 text-caption font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
                {weeks.flat().map((day) => {
                  const key = dateKey(day)
                  const inMonth = day.getMonth() === month.month
                  const items = byDay.get(key) ?? []
                  const canPlan = key >= todayKey
                  return (
                    <div
                      key={key}
                      role="gridcell"
                      aria-label={day.toLocaleDateString('en-IN', { dateStyle: 'full' })}
                      className={cn('group flex min-h-24 flex-col gap-1 border-r border-b border-border p-1.5', !inMonth && 'bg-muted/30')}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'flex size-6 items-center justify-center rounded-full text-caption',
                            key === todayKey && 'bg-brand-primary font-semibold text-white',
                            !inMonth && key !== todayKey && 'text-muted-foreground',
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {canPlan && (
                          <Link
                            to={`/campaigns/new?date=${key}`}
                            aria-label={`Plan a campaign on ${day.toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
                            className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </Link>
                        )}
                      </div>
                      {isPending ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        items.map((c) => (
                          <Link
                            key={c.id}
                            to={`/campaigns/${c.id}`}
                            title={`${c.name} — ${c.isDue ? 'due, not sent' : c.status}`}
                            className={cn(
                              'flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-caption hover:underline',
                              CHIP_STYLE[c.status],
                              c.isDue && 'bg-destructive/15',
                            )}
                          >
                            {c.repeatYearly && <Repeat className="size-3 shrink-0" aria-label="Repeats every year" />}
                            <span className="truncate">{c.name}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-caption text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className={cn('size-3 rounded', CHIP_STYLE.sent)} />Sent</span>
                <span className="flex items-center gap-1.5"><span className={cn('size-3 rounded', CHIP_STYLE.scheduled)} />Scheduled</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-destructive/15" />Due, not sent yet</span>
                <span className="flex items-center gap-1.5"><Repeat className="size-3" />Repeats every year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardSectionHeading>Drafts (no date)</CardSectionHeading>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {isPending ? (
                <Skeleton className="h-8 w-full" />
              ) : drafts.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No unscheduled drafts.</p>
              ) : (
                drafts.map((c) => (
                  <Link
                    key={c.id}
                    to={`/campaigns/${c.id}`}
                    className="rounded-md border border-border px-2.5 py-1.5 text-body-sm hover:bg-muted"
                  >
                    {c.name}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
