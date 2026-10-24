import { KpiCard, KpiCardSkeleton, type KpiCardData } from '@/components/shared/KpiCard'
import { useFeedbackSummary } from '@/features/feedback/hooks/useFeedbackSummary'

/**
 * Feedback overview summary — docs/IMPLEMENTATION_PLAN.md Phase 10
 * "feedback summary". Shown on /feedback only; the All and Negative
 * routes stay plain lists. Hidden on error — the list below shows its
 * own error state with Retry.
 */
export function FeedbackSummaryStrip() {
  const { data, isPending, isError } = useFeedbackSummary()

  if (isError) return null

  const kpis: KpiCardData[] = data
    ? [
        { id: 'total', label: 'Total feedback', value: String(data.total) },
        {
          id: 'average',
          label: `Average rating (${data.ratedCount} rated)`,
          value: data.averageRating !== null ? `${data.averageRating.toFixed(1)} / 5` : '—',
        },
        { id: 'attention', label: 'Needs attention', value: String(data.needsAttention) },
        { id: 'negative', label: 'Negative', value: String(data.negative) },
      ]
    : []

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Feedback summary">
      {isPending
        ? [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
        : kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
    </div>
  )
}
