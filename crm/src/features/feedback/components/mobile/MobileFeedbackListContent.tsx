import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { FeedbackEmptyState } from '@/features/feedback/components/shared/FeedbackEmptyState'
import { FeedbackErrorState } from '@/features/feedback/components/shared/FeedbackErrorState'
import { FeedbackCard, FeedbackCardSkeleton } from '@/features/feedback/components/mobile/FeedbackCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFeedbackList } from '@/features/feedback/hooks/useFeedbackList'
import type { FeedbackSentimentFilter } from '@/features/feedback/types/feedback'

const PAGE_SIZE_STEP = 10

/**
 * Mobile Feedback list — search → cards → Load more, same pattern as
 * Orders/Customers/Loyalty. One underlying implementation for all three
 * list routes; the sentiment filter is fixed by the route (no filter
 * control on mobile — same precedent as Orders/Loyalty's mobile lists
 * omitting desktop-only filter controls). h2, not h1 — MobileHeader
 * already renders this screen's page h1 ("Feedback", shared by all four
 * Feedback routes).
 */
export function MobileFeedbackListContent({
  title,
  initialSentiment,
}: {
  title: string
  initialSentiment: FeedbackSentimentFilter
}) {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch, isFetching } = useFeedbackList({
    search: debouncedSearch,
    sentiment: initialSentiment,
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
      <h2 className="text-page-title font-semibold">{title}</h2>
      <SearchInput
        id="feedback-search-mobile"
        label="Search feedback by customer name"
        placeholder="Search by customer name"
        value={search}
        onChange={(value) => {
          setSearch(value)
          setPageSize(PAGE_SIZE_STEP)
        }}
      />

      {isError ? (
        <FeedbackErrorState message="Couldn't load feedback." onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <FeedbackCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <FeedbackEmptyState
          search={debouncedSearch}
          hasOtherFilters={initialSentiment !== 'all'}
          message="No feedback yet."
          onClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
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
