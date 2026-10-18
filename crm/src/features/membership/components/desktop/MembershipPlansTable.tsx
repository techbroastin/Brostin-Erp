import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { MembershipPlan } from '@/features/membership/types/membership'

/**
 * No pagination/sort — the illustrative catalogue is small and
 * read-only, per the approved Phase 9 scope. No price/duration/benefit
 * column: no such field exists on MembershipPlan.
 */
export function MembershipPlansTable({
  items,
  isLoading,
}: {
  items: MembershipPlan[]
  isLoading: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 2 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : items.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.description}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
