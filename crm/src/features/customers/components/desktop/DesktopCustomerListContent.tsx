import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Upload } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CustomerSearchInput } from '@/features/customers/components/shared/CustomerSearchInput'
import { CustomerEmptyState } from '@/features/customers/components/shared/CustomerEmptyState'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import { CustomerTable, PAGE_SIZE } from '@/features/customers/components/desktop/CustomerTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useCustomerList } from '@/features/customers/hooks/useCustomerList'
import { useDuplicateGroups } from '@/features/customers/hooks/useCustomerTools'
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
  const [showArchived, setShowArchived] = useState(false)
  const duplicates = useDuplicateGroups()

  const { data, isPending, isError, refetch } = useCustomerList({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
    includeArchived: showArchived,
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
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Customers</h1>
          <DemoDataBadge />
        </div>
        <div className="flex items-center gap-2">
          <Link to="/customers/duplicates" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <Copy className="size-4" />
            Duplicates{duplicates.data && duplicates.data.length > 0 ? ` (${duplicates.data.length})` : ''}
          </Link>
          <Link to="/customers/import" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <Upload className="size-4" />
            Import
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-sm">
          <CustomerSearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-body-sm">
          <input
            type="checkbox"
            className="accent-brand-primary"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked)
              setPage(1)
            }}
          />
          Show archived
        </label>
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
