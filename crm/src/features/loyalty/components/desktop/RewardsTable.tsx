import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { Reward } from '@/features/loyalty/types/loyalty'

/**
 * No pagination/sort — the illustrative catalogue is small (a handful of
 * entries) and read-only, per the approved Phase 6 scope.
 */
export function RewardsTable({ items, isLoading }: { items: Reward[]; isLoading: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reward</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Point Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 3 }).map((__, j) => (
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
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
