import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import { useDuplicateGroups } from '@/features/customers/hooks/useCustomerTools'
import { listCustomers } from '@/features/customers/services/customerService'
import { formatCalendarDate, formatRupees, formatTimestampDate } from '@/features/customers/utils/customerFormat'

const selectClassName =
  'h-8 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const ALL_CUSTOMERS = { search: '', page: 1, pageSize: 1000, sortBy: 'name' } as const

/**
 * Book 3 §1 Merge Tool, step 1: customers sharing a phone number (the
 * merge key), plus a manual pick for duplicates whose phone was typo'd.
 * Nothing changes until the merge is reviewed and confirmed.
 */
export function DesktopDuplicatesContent() {
  const navigate = useNavigate()
  const groups = useDuplicateGroups()
  const customers = useQuery({ queryKey: ['customers', 'list', ALL_CUSTOMERS], queryFn: () => listCustomers(ALL_CUSTOMERS) })
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">Duplicate customers</h1>
        <DemoDataBadge />
      </div>
      <p className="max-w-3xl text-body-sm text-muted-foreground">
        Customers are matched by phone number, however it was typed. Merging keeps one record, adds up orders, spend
        and points, and archives the other — nothing is deleted. Where the two disagree (name, birthday, WhatsApp
        consent) you choose which to keep.
      </p>

      {groups.isError ? (
        <CustomerErrorState onRetry={() => groups.refetch()} />
      ) : groups.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : groups.data.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-body-sm">
            <CheckCircle2 className="size-5 text-success" />
            No customers share a phone number.
          </CardContent>
        </Card>
      ) : (
        groups.data.map((group) => (
          <Card key={group[0].id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardSectionHeading>
                {group.length} records share {group[0].phone.replace(/\D/g, '').slice(-10)}
              </CardSectionHeading>
              {group.length === 2 && (
                <Link
                  to={`/customers/merge?primary=${group[0].id}&secondary=${group[1].id}`}
                  className={buttonVariants({ variant: 'default', size: 'sm' })}
                >
                  Review merge
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone as entered</TableHead>
                    <TableHead>Date of birth</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead>First visit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link to={`/customers/${c.id}`} className="font-medium hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-body-sm">{c.phone}</TableCell>
                      <TableCell>{formatCalendarDate(c.dateOfBirth)}</TableCell>
                      <TableCell className="text-right">{c.orderCount}</TableCell>
                      <TableCell className="text-right">{formatRupees(c.lifetimeSpend)}</TableCell>
                      <TableCell>{formatTimestampDate(c.firstVisitAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {group.length > 2 && (
                <p className="mt-2 text-caption text-muted-foreground">
                  Merge these two at a time using "Merge any two customers" below.
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader>
          <CardSectionHeading>Merge any two customers</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-body-sm text-muted-foreground">
            For the same person entered twice with different phone numbers (for example, a typo that was fixed later).
          </p>
          <div className="flex items-center gap-2">
            {[
              { id: 'merge-first', label: 'Keep', value: first, set: setFirst },
              { id: 'merge-second', label: 'Merge in', value: second, set: setSecond },
            ].map((pick) => (
              <label key={pick.id} className="flex min-w-0 flex-1 items-center gap-2 text-body-sm">
                <span className="shrink-0 text-muted-foreground">{pick.label}</span>
                <select id={pick.id} className={selectClassName} value={pick.value} onChange={(e) => pick.set(e.target.value)}>
                  <option value="">Choose a customer…</option>
                  {(customers.data?.items ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button
              type="button"
              disabled={!first || !second || first === second}
              onClick={() => navigate(`/customers/merge?primary=${first}&secondary=${second}`)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Review merge
            </button>
          </div>
          {first && first === second && <p className="text-caption text-destructive">Pick two different customers.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
