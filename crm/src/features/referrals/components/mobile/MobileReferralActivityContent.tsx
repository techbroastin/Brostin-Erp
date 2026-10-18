import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { ReferralEmptyState } from '@/features/referrals/components/shared/ReferralEmptyState'
import { ReferralErrorState } from '@/features/referrals/components/shared/ReferralErrorState'
import {
  ReferralActivityRow,
  ReferralActivityRowSkeleton,
} from '@/features/referrals/components/mobile/ReferralActivityRow'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useReferralActivity } from '@/features/referrals/hooks/useReferralActivity'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Referral Activity — search → cards → Load more, same pattern as
 * Loyalty/Feedback. h2, not h1 — see MobileReferralOverviewContent.
 */
export function MobileReferralActivityContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useReferralActivity({
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
      <h2 className="text-page-title font-semibold">Activity</h2>
      <SearchInput
        id="referral-activity-search-mobile"
        label="Search referral activity by referrer or referred contact name"
        placeholder="Search by name or phone"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <ReferralErrorState message="Couldn't load referral activity." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <ReferralActivityRowSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <ReferralEmptyState
          search={debouncedSearch}
          message="No referral activity yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((record) => (
              <ReferralActivityRow key={record.id} record={record} />
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
