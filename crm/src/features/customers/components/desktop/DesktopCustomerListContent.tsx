import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CustomerSearchInput } from '@/features/customers/components/shared/CustomerSearchInput'
import { CustomerEmptyState } from '@/features/customers/components/shared/CustomerEmptyState'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import { CustomerTable, PAGE_SIZE } from '@/features/customers/components/desktop/CustomerTable'
import { useDebouncedValue } from '@/features/customers/hooks/useDebouncedValue'
import { useCustomerList } from '@/features/customers/hooks/useCustomerList'
import type { CustomerSortBy } from '@/features/customers/types/customer'

/**
 * Desktop Customer list — docs/DESKTOP_UI_SPEC.md §9/§10: persistent
 * filter bar (search only, see Phase 4 scope decision) + sortable, paged
 * table.
 */
export function DesktopCustomerListContent() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortBy>('name')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useCustomerList({
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
        <h1 className="text-page-title font-semibold">Customers</h1>
        <DemoDataBadge />
      </div>

      <div className="max-w-sm">
        <CustomerSearchInput
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
            <CustomerErrorState onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <CustomerEmptyState search={debouncedSearch} onClearSearch={handleClearSearch} />
          ) : (
            <CustomerTable
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
