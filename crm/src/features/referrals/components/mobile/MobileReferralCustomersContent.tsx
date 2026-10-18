import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import {
  ReferralCustomerCard,
  ReferralCustomerCardSkeleton,
} from '@/features/referrals/components/mobile/ReferralCustomerCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useReferralCustomers } from '@/features/referrals/hooks/useReferralCustomers'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Referral Customers — search → cards → Load more, same pattern
 * as Loyalty/Feedback. h2, not h1 — see MobileReferralOverviewContent.
 */
export function MobileReferralCustomersContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useReferralCustomers({
    search: debouncedSearch,
    page: 1,
    pageSize,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = items.length < total

  const handleClearSearch = () => {
    setSearch('')
    setPageSize(PAGE_SIZE_STEP)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <DemoDataBadge />
      <h2 className="text-page-title font-semibold">Customers</h2>
      <SearchInput
        id="referral-customers-search-mobile"
        label="Search referrals by referrer or referred contact name"
        placeholder="Search by name or phone"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <ReferralErrorState message="Couldn't load referral customers." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <ReferralCustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ReferralEmptyState
          search={debouncedSearch}
          message="No referrals yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((record) => (
              <ReferralCustomerCard key={record.id} record={record} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setPageSize((size) => size + PAGE_SIZE_STEP)}
              disabled={isFetching}
              className={buttonVariants({ variant: 'outline' })}
            >
              {isFetching ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
