import { cn } from '@/lib/utils'

/**
 * Broastin identity, shared by the mobile hamburger menu
 * (docs/MOBILE_UI_SPEC.md §8) and the desktop sidebar
 * (docs/DESKTOP_UI_SPEC.md §5). Wordmark only — no logo asset exists yet
 * for the CRM; do not invent one.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('text-section-title font-semibold tracking-tight', className)}>
      Broastin
    </span>
  )
}
