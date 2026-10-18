import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { FeedbackEmptyState } from '@/features/feedback/components/shared/FeedbackEmptyState'
import { FeedbackErrorState } from '@/features/feedback/components/shared/FeedbackErrorState'
import { FeedbackTable, PAGE_SIZE } from '@/features/feedback/components/desktop/FeedbackTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFeedbackList } from '@/features/feedback/hooks/useFeedbackList'
import type { FeedbackSentimentFilter } from '@/features/feedback/types/feedback'

const SENTIMENT_OPTIONS: { value: FeedbackSentimentFilter; label: string }[] = [
  { value: 'all', label: 'All sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Desktop Feedback list — one underlying implementation for all three
 * list routes (/feedback, /feedback/all, /feedback/negative). The route
 * sets the initial title/sentiment filter (see FeedbackListScreen); the
 * sentiment select remains freely adjustable afterward, same as
 * Orders'/Loyalty's desktop filters.
 */
export function DesktopFeedbackListContent({
  title,
  initialSentiment,
}: {
  title: string
  initialSentiment: FeedbackSentimentFilter
}) {
  const [search, setSearch] = useState('')
  const [sentiment, setSentiment] = useState<FeedbackSentimentFilter>(initialSentiment)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isPending, isError, refetch } = useFeedbackList({
    search: debouncedSearch,
    sentiment,
    page,
    pageSize: PAGE_SIZE,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleClearFilters = () => {
    setSearch('')
    setSentiment('all')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">{title}</h1>
        <DemoDataBadge />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            id="feedback-search"
            label="Search feedback by customer name"
            placeholder="Search by customer name"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        </div>
        <select
          aria-label="Filter by sentiment"
          className={selectClassName}
          value={sentiment}
          onChange={(e) => {
            setSentiment(e.target.value as FeedbackSentimentFilter)
            setPage(1)
          }}
        >
          {SENTIMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <FeedbackErrorState message="Couldn't load feedback." onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <FeedbackEmptyState
              search={debouncedSearch}
              hasOtherFilters={sentiment !== 'all'}
              message="No feedback yet."
              onClearSearch={handleClearFilters}
            />
          ) : (
            <FeedbackTable items={items} isLoading={isPending} page={page} total={total} onPageChange={setPage} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
