import { Menu } from 'lucide-react'

/**
 * Fixed mobile top bar — docs/MOBILE_UI_SPEC.md §7 ("[☰] Page Title
 * [Action]"), styled after the owner's mobile UI reference: Broastin red
 * bar with the official logo, white page title (the screen's h1; on Home
 * it reads "Broastin" in the accent yellow). The reference's bell is left
 * out: notifications aren't built, and an inert bell would look tappable.
 * Mobile-only. Consumed by MobileShellLayout, never by desktop.
 */
export function MobileHeader({
  title,
  isHome,
  onMenuClick,
}: {
  title: string
  isHome: boolean
  onMenuClick: () => void
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-gradient-to-r from-brand-primary-deep to-brand-primary px-2 text-white">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <Menu className="size-5.5" />
      </button>
      <img src="/brand/broastin-logo-192.png" alt="" aria-hidden="true" className="size-8 shrink-0 drop-shadow" />
      <h1 className={isHome ? 'flex-1 truncate text-section-title font-extrabold text-brand-accent' : 'flex-1 truncate text-section-title font-bold'}>
        {isHome ? 'Broastin' : title}
      </h1>
    </header>
  )
}
