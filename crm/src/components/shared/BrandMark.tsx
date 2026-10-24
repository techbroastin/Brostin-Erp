import { cn } from '@/lib/utils'

/**
 * Broastin identity, shared by the mobile hamburger menu
 * (docs/MOBILE_UI_SPEC.md §8) and the desktop sidebar
 * (docs/DESKTOP_UI_SPEC.md §5). `withLogo` shows the official Broastin
 * logo (CLAUDE.md §22: assets/branding/broastin/logo/broastin logo.png —
 * public/brand/broastin-logo-192.png is a size-reduced copy of that
 * exact file, never a redrawn one) beside the name.
 */
export function BrandMark({
  className,
  withLogo = false,
  subtitle,
  nameClassName,
}: {
  className?: string
  withLogo?: boolean
  subtitle?: string
  nameClassName?: string
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {withLogo && (
        <img src="/brand/broastin-logo-192.png" alt="" aria-hidden="true" className="size-11 shrink-0 drop-shadow" />
      )}
      <span className="flex flex-col leading-none">
        <span className={cn('text-section-title font-semibold tracking-tight', nameClassName)}>Broastin</span>
        {subtitle && <span className="mt-1 text-caption font-medium tracking-[0.18em] uppercase opacity-90">{subtitle}</span>}
      </span>
    </span>
  )
}
