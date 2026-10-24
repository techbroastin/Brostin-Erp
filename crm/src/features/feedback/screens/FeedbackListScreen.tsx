import { useLocation } from 'react-router-dom'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { MobileFeedbackListContent } from '@/features/feedback/components/mobile/MobileFeedbackListContent'
import { DesktopFeedbackListContent } from '@/features/feedback/components/desktop/DesktopFeedbackListContent'
import type { FeedbackSentimentFilter } from '@/features/feedback/types/feedback'

/**
 * One underlying list implementation serves all three Feedback list
 * routes (/feedback, /feedback/all, /feedback/negative) — the approved
 * Phase 7 scope. The route determines the initial title and sentiment
 * filter; `key={pathname}` forces a remount when navigating between
 * these three sibling routes so the new route's filter/title actually
 * takes effect (React Router does not remount a shared element type by
 * default when only the path changes).
 */
function resolveView(pathname: string): { title: string; initialSentiment: FeedbackSentimentFilter } {
  if (pathname === '/feedback/negative') {
    return { title: 'Negative Feedback', initialSentiment: 'negative' }
  }
  if (pathname === '/feedback/all') {
    return { title: 'All Feedback', initialSentiment: 'all' }
  }
  return { title: 'Feedback', initialSentiment: 'all' }
}

export function FeedbackListScreen() {
  const location = useLocation()
  const isDesktop = useIsDesktopViewport()
  const { title, initialSentiment } = resolveView(location.pathname)
  // The overview route adds the summary strip; All/Negative are plain lists.
  const showSummary = location.pathname === '/feedback'

  return isDesktop ? (
    <DesktopFeedbackListContent key={location.pathname} title={title} initialSentiment={initialSentiment} showSummary={showSummary} />
  ) : (
    <MobileFeedbackListContent key={location.pathname} title={title} initialSentiment={initialSentiment} showSummary={showSummary} />
  )
}
