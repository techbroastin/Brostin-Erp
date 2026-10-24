import { AlertTriangle, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Segment, SegmentKind } from '@/features/segments/types/segment'
import { describeRule } from '@/features/segments/utils/segmentRules'

export function SegmentKindBadge({ kind }: { kind: SegmentKind }) {
  return kind === 'prebuilt' ? (
    <Badge variant="secondary">Pre-built</Badge>
  ) : (
    <Badge variant="outline">Custom</Badge>
  )
}

/** The rules as plain sentences joined by AND/OR. */
export function SegmentRuleList({ segment }: { segment: Pick<Segment, 'match' | 'rules'> }) {
  const joiner = segment.match === 'all' ? 'and' : 'or'
  return (
    <ul className="flex flex-col gap-1.5 text-body-sm">
      {segment.rules.map((rule, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-1.5">
          {i > 0 && <span className="text-caption font-medium uppercase text-muted-foreground">{joiner}</span>}
          <span>{describeRule(rule)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Mirrors the other features' error states — docs/DESIGN_SYSTEM.md §43. */
export function SegmentErrorState({
  message = "Couldn't load segments",
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <h2 className="text-section-title font-semibold">{message}</h2>
        <p className="mt-1 text-body text-muted-foreground">Something went wrong. Please try again.</p>
      </div>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: 'default' })}>
        Retry
      </button>
    </div>
  )
}

/**
 * The Segment Builder is a desktop workflow (docs/CLAUDE.md §8 — "audience
 * segmentation", "builders"). Mobile managers can still browse segments
 * and their members.
 */
export function SegmentBuilderDesktopOnlyNotice() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 py-16 text-center text-muted-foreground">
      <Monitor className="size-8" />
      <div>
        <h2 className="text-section-title font-semibold text-foreground">Desktop Admin only</h2>
        <p className="mt-1 max-w-xs text-body-sm">
          Segments are built and edited from Desktop Admin. Open this page on a larger screen to continue.
        </p>
      </div>
    </div>
  )
}

export function SegmentNotFound() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 py-16 text-center">
      <p className="text-body font-medium">Segment not found.</p>
      <p className="text-body-sm text-muted-foreground">This segment doesn't exist or may have been removed.</p>
    </div>
  )
}
