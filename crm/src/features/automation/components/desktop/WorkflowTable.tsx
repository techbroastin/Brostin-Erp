import { Link } from 'react-router-dom'
import { ArrowUpDown } from 'lucide-react'
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
import { WorkflowStatusBadge } from '@/features/automation/components/shared/WorkflowStatusBadge'
import { TRIGGER_LABELS } from '@/features/automation/types/automation'
import type { Workflow, WorkflowSortBy } from '@/features/automation/types/automation'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

/** docs/DESKTOP_UI_SPEC.md §9 — sortable columns, status-as-badge, row action. */
export function WorkflowTable({
  items,
  isLoading,
  sortBy,
  onSortChange,
  page,
  total,
  onPageChange,
}: {
  items: Workflow[]
  isLoading: boolean
  sortBy: WorkflowSortBy
  onSortChange: (sortBy: WorkflowSortBy) => void
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
            <TableHead>Trigger</TableHead>
            <TableHead>Actions</TableHead>
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
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : items.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>
                    <WorkflowStatusBadge status={workflow.status} />
                  </TableCell>
                  <TableCell>{TRIGGER_LABELS[workflow.triggerType]}</TableCell>
                  <TableCell>{workflow.actions.length}</TableCell>
                  <TableCell>
                    {new Date(workflow.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/automation/${workflow.id}`}
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
              ? '0 workflows'
              : `Page ${page} of ${totalPages} · ${total} workflows`}
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
