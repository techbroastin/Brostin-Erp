import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import { ReferralActivityTable, PAGE_SIZE } from '@/features/referrals/components/desktop/ReferralActivityTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useReferralActivity } from '@/features/referrals/hooks/useReferralActivity'

/**
 * Desktop Referral Activity — search + paged, chronological table of
 * illustrative referral records. Not a reconciled qualification/reward
 * ledger (docs/IMPLEMENTATION_PLAN.md §14 — no qualifying-event rule
 * exists yet).
 */
export function DesktopReferralActivityContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useReferralActivity({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleClearSearch = () => {
    setSearch('')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Activity</h1>
        <DemoDataBadge />
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="referral-activity-search"
          label="Search referral activity by referrer or referred contact name"
          placeholder="Search by name or phone"
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <ReferralErrorState message="Couldn't load referral activity." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <ReferralEmptyState
              search={debouncedSearch}
              message="No referral activity yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <ReferralActivityTable
              items={items}
              isLoading={isPending}
              page={page}
              total={total}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
