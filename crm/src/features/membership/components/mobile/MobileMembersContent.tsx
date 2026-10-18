import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { MemberCard, MemberCardSkeleton } from '@/features/membership/components/mobile/MemberCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMembers } from '@/features/membership/hooks/useMembers'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Members — search → cards → Load more, same pattern as
 * Loyalty/Feedback/Referrals. h2, not h1 — see
 * MobileMembershipOverviewContent. Search-only, no status filter
 * (approved Phase 9 scope).
 */
export function MobileMembersContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useMembers({
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
      <h2 className="text-page-title font-semibold">Members</h2>
      <SearchInput
        id="membership-members-search-mobile"
        label="Search members by customer or plan name"
        placeholder="Search by name"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <MembershipErrorState message="Couldn't load members." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <MemberCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <MembershipEmptyState
          search={debouncedSearch}
          message="No members yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((member) => (
              <MemberCard key={member.id} member={member} />
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
