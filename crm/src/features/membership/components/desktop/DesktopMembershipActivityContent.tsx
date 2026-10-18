import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { MembershipActivityTable, PAGE_SIZE } from '@/features/membership/components/desktop/MembershipActivityTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMembershipActivity } from '@/features/membership/hooks/useMembershipActivity'

/**
 * Desktop Membership Activity — search + paged, chronological table of
 * illustrative membership events. Not a reconciled billing/renewal
 * ledger (no such rule exists yet).
 */
export function DesktopMembershipActivityContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useMembershipActivity({
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
          id="membership-activity-search"
          label="Search membership activity by customer name"
          placeholder="Search by name"
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
            <MembershipErrorState message="Couldn't load membership activity." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <MembershipEmptyState
              search={debouncedSearch}
              message="No membership activity yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <MembershipActivityTable
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
