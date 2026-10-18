import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import { ReferralCustomerTable, PAGE_SIZE } from '@/features/referrals/components/desktop/ReferralCustomerTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useReferralCustomers } from '@/features/referrals/hooks/useReferralCustomers'

/**
 * Desktop Referral Customers — search + paged table of referral
 * relationships. Data comes from the customers feature for the referrer
 * (and for a registered referred contact), so identity always matches
 * /customers.
 */
export function DesktopReferralCustomersContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useReferralCustomers({
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
        <h1 className="text-page-title font-semibold">Customers</h1>
        <DemoDataBadge />
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="referral-customers-search"
          label="Search referrals by referrer or referred contact name"
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
            <ReferralErrorState message="Couldn't load referral customers." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <ReferralEmptyState
              search={debouncedSearch}
              message="No referrals yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <ReferralCustomerTable
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
