import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { LoyaltyActivityTable, PAGE_SIZE } from '@/features/loyalty/components/desktop/LoyaltyActivityTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useLoyaltyActivity } from '@/features/loyalty/hooks/useLoyaltyActivity'

/**
 * Desktop Activity — search + paged table of illustrative loyalty
 * events. Not a reconciled points ledger (docs/IMPLEMENTATION_PLAN.md
 * §12 — no earn/redeem calculation rule exists yet).
 */
export function DesktopLoyaltyActivityContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useLoyaltyActivity({
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
          id="loyalty-activity-search"
          label="Search activity by customer name"
          placeholder="Search by customer name"
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
            <LoyaltyErrorState message="Couldn't load loyalty activity." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <LoyaltyEmptyState
              search={debouncedSearch}
              message="No loyalty activity yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <LoyaltyActivityTable
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
