import { Link } from 'react-router-dom'
import { ArrowUpDown, Repeat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { CampaignStatusBadge } from '@/features/campaigns/components/shared/CampaignStatusBadge'
import type { CampaignSortBy, CampaignSummary } from '@/features/campaigns/types/campaign'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

/** docs/DESKTOP_UI_SPEC.md §9 — sortable columns, status-as-badge, row action. */
export function CampaignTable({
  items,
  isLoading,
  sortBy,
  onSortChange,
  page,
  total,
  onPageChange,
}: {
  items: CampaignSummary[]
  isLoading: boolean
  sortBy: CampaignSortBy
  onSortChange: (sortBy: CampaignSortBy) => void
  page: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('name')}
                className={cn('flex items-center gap-1', sortBy === 'name' && 'text-foreground')}
              >
                Name
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => onSortChange('createdAt')}
                className={cn('flex items-center gap-1', sortBy === 'createdAt' && 'text-foreground')}
              >
                Created
                <ArrowUpDown className="size-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <CampaignStatusBadge status={campaign.status} />
                      {campaign.isDue && <Badge variant="destructive">Due</Badge>}
                      {campaign.repeatYearly && <Repeat className="size-3.5 text-muted-foreground" aria-label="Repeats every year" />}
                    </span>
                  </TableCell>
                  <TableCell>
                    {campaign.segmentName ?? <span className="text-destructive">Segment deleted</span>}
                    <span className="text-muted-foreground"> · {campaign.audienceCount}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-body-sm text-muted-foreground">
        <span>
          {isLoading
            ? 'Loading…'
            : total === 0
              ? '0 campaigns'
              : `Page ${page} of ${totalPages} · ${total} campaigns`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={isLoading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
