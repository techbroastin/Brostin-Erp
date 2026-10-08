import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Fixed mobile top bar — docs/MOBILE_UI_SPEC.md §7:
 * "[☰]   Page Title                     [Action]"
 * Mobile-only. Consumed by MobileShellLayout, never by desktop.
 */
export function MobileHeader({
  title,
  onMenuClick,
  action,
}: {
  title: string
  onMenuClick: () => void
  action?: ReactNode
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>
      <h1 className="flex-1 truncate text-page-title font-semibold">{title}</h1>
      {action}
    </header>
  )
}
