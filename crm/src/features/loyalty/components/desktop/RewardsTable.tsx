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
import type { Reward } from '@/features/loyalty/types/loyalty'

/** No pagination/sort — the catalogue is small (a handful of entries). */
export function RewardsTable({
  items,
  isLoading,
  onEdit,
}: {
  items: Reward[]
  isLoading: boolean
  onEdit: (reward: Reward) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reward</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Point Cost</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : items.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell className="font-medium">{reward.name}</TableCell>
                <TableCell>{reward.description}</TableCell>
                <TableCell className="text-right">{reward.pointCost}</TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(reward)}
                    aria-label={`Edit ${reward.name}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
