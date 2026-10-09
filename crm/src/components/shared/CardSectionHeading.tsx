import type { ReactNode } from 'react'

/**
 * shadcn's CardTitle renders a plain <div>, not a heading element, so it
 * can't be used for real section headings without losing semantic
 * structure (docs/DESKTOP_UI_SPEC.md §22). This matches CardTitle's own
 * visual style without modifying the generated primitive. Shared across
 * features (Customers, Orders) per docs/FRONTEND_ARCHITECTURE.md §6.
 */
export function CardSectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-base leading-snug font-medium">{children}</h2>
}
