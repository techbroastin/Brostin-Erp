import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { MembershipEmptyState } from '@/features/membership/components/shared/MembershipEmptyState'
import { MembershipErrorState } from '@/features/membership/components/shared/MembershipErrorState'
import { MemberTable, PAGE_SIZE } from '@/features/membership/components/desktop/MemberTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMembers } from '@/features/membership/hooks/useMembers'

/**
 * Desktop Members — search + paged table of membership records. Data
 * comes from the customers feature for each member's identity, so a
 * member's name here always matches /customers. Search-only, no status
 * filter (approved Phase 9 scope).
 */
export function DesktopMembersContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useMembers({
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
        <h1 className="text-page-title font-semibold">Members</h1>
        <DemoDataBadge />
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="membership-members-search"
          label="Search members by customer or plan name"
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
            <MembershipErrorState message="Couldn't load members." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <MembershipEmptyState
              search={debouncedSearch}
              message="No members yet."
              onClearSearch={handleClearSearch}
            />
          ) : (
            <MemberTable items={items} isLoading={isPending} page={page} total={total} onPageChange={setPage} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
