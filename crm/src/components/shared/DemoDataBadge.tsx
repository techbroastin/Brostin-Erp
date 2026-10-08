import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * The visible "this is mock data" indicator docs/FRONTEND_ARCHITECTURE.md
 * §16 requires. Used by two or more features, so it lives here per
 * §6 ("a component used by two or more features moves to
 * components/shared"). Not cosmetic — do not remove.
 */
export function DemoDataBadge() {
  return (
    <Badge variant="outline" className="gap-1 text-info">
      <Info className="size-3" />
      Demo data
    </Badge>
  )
}
