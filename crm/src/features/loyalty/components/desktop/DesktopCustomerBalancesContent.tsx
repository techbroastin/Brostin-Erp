import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoyaltyEmptyState } from '@/features/loyalty/components/shared/LoyaltyEmptyState'
import { LoyaltyErrorState } from '@/features/loyalty/components/shared/LoyaltyErrorState'
import { CustomerBalanceTable, PAGE_SIZE } from '@/features/loyalty/components/desktop/CustomerBalanceTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useCustomerBalances } from '@/features/loyalty/hooks/useCustomerBalances'
import type { CustomerBalanceSortBy } from '@/features/loyalty/types/loyalty'

/**
 * Desktop Customer Balances — search + sortable, paged table. Data comes
 * from the customers feature (see loyaltyService), so a balance here
 * always matches the same customer's balance on /customers.
 */
export function DesktopCustomerBalancesContent() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerBalanceSortBy>('name')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useCustomerBalances({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
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
        <h1 className="text-page-title font-semibold">Customer Balances</h1>
        <DemoDataBadge />
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="loyalty-balance-search"
          label="Search customer balances by name or phone"
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
            <LoyaltyErrorState message="Couldn't load customer balances." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <LoyaltyEmptyState
              search={debouncedSearch}
              message="No customer balances yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <CustomerBalanceTable
              items={items}
              isLoading={isPending}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSortBy(value)
                setPage(1)
              }}
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
