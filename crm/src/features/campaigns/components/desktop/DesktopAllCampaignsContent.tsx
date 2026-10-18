import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { CampaignTable } from '@/features/campaigns/components/desktop/CampaignTable'
import { useCampaigns } from '@/features/campaigns/hooks/useCampaigns'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { CampaignSortBy } from '@/features/campaigns/types/campaign'

const PAGE_SIZE = 10

/** Desktop All Campaigns — search + sortable, paged table, mirrors DesktopOrderListContent. */
export function DesktopAllCampaignsContent() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CampaignSortBy>('createdAt')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useCampaigns({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">All Campaigns</h1>
        <div className="flex items-center gap-2">
          <DemoDataBadge />
          <Link to="/campaigns/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Create Campaign
          </Link>
        </div>
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="campaign-search"
          label="Search campaigns"
          placeholder="Search by name…"
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
            <CampaignErrorState message="Couldn't load campaigns." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <p className="text-body-sm">
                {debouncedSearch ? 'No campaigns match your search.' : 'No campaigns yet.'}
              </p>
              {!debouncedSearch && (
                <Link to="/campaigns/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Create Campaign
                </Link>
              )}
            </div>
          ) : (
            <CampaignTable
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
