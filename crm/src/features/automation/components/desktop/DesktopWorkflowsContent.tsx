import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { AutomationErrorState } from '@/features/automation/components/shared/AutomationErrorState'
import { WorkflowTable } from '@/features/automation/components/desktop/WorkflowTable'
import { useAutomationWorkflows } from '@/features/automation/hooks/useAutomationWorkflows'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { WorkflowSortBy } from '@/features/automation/types/automation'

const PAGE_SIZE = 10

/** Desktop Workflows list — search + sortable, paged table, mirrors DesktopAllCampaignsContent. */
export function DesktopWorkflowsContent() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<WorkflowSortBy>('createdAt')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useAutomationWorkflows({
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
        <h1 className="text-page-title font-semibold">Workflows</h1>
        <div className="flex items-center gap-2">
          <DemoDataBadge />
          <Link to="/automation/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Create Workflow
          </Link>
        </div>
      </div>

      <div className="max-w-sm">
        <SearchInput
          id="workflow-search"
          label="Search workflows"
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
            <AutomationErrorState message="Couldn't load workflows." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <p className="text-body-sm">
                {debouncedSearch ? 'No workflows match your search.' : 'No workflows yet.'}
              </p>
              {!debouncedSearch && (
                <Link to="/automation/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Create Workflow
                </Link>
              )}
            </div>
          ) : (
            <WorkflowTable
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
