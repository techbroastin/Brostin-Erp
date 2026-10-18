import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import {
  MembershipActivityRow,
  MembershipActivityRowSkeleton,
} from '@/features/membership/components/mobile/MembershipActivityRow'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMembershipActivity } from '@/features/membership/hooks/useMembershipActivity'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Membership Activity — search → cards → Load more, same
 * pattern as Loyalty/Feedback/Referrals. h2, not h1 — see
 * MobileMembershipOverviewContent.
 */
export function MobileMembershipActivityContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useMembershipActivity({
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
        id="membership-activity-search-mobile"
        label="Search membership activity by customer name"
        placeholder="Search by name"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <MembershipErrorState message="Couldn't load membership activity." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <MembershipActivityRowSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <MembershipEmptyState
          search={debouncedSearch}
          message="No membership activity yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((record) => (
              <MembershipActivityRow key={record.id} record={record} />
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
