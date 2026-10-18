import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReferralReward } from '@/features/referrals/types/referral'

/**
 * No pagination/sort — the illustrative catalogue is small and
 * read-only, per the approved Phase 8 scope. No cost/value column: no
 * such field exists on ReferralReward (see its type definition).
 */
export function ReferralRewardsTable({
  items,
  isLoading,
}: {
  items: ReferralReward[]
  isLoading: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reward</TableHead>
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
          : items.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell className="font-medium">{reward.name}</TableCell>
                <TableCell>{reward.description}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
