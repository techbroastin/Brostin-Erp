import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { SEGMENT_LABELS, type Customer } from '@/features/customers/types/customer'
import { formatCalendarDate } from '@/features/customers/utils/customerFormat'

/**
 * Book 3 §1 profile fields, shared by the mobile and desktop detail
 * screens. Label/value rows stack cleanly inside a narrow mobile card
 * and the desktop Profile column alike. Segments and programs are
 * placeholder values until the Segmentation/Program engines exist.
 */
export function CustomerProfileDetails({ customer }: { customer: Customer }) {
  return (
    <dl className="flex flex-col gap-3">
      <Row label="Date of birth">{formatCalendarDate(customer.dateOfBirth)}</Row>
      <Row label="Anniversary">{formatCalendarDate(customer.anniversaryDate)}</Row>
      <Row label="Preferred outlet">
        {customer.preferredOutlets.length > 0 ? customer.preferredOutlets.join(', ') : '—'}
      </Row>
      <Row label="WhatsApp">{customer.whatsappOptIn ? 'Opted in' : 'Not opted in'}</Row>
      <Row label="Preferences">
        <BadgeList items={customer.preferenceTags} variant="outline" />
      </Row>
      <Row label="Segments">
        <BadgeList items={customer.segments.map((s) => SEGMENT_LABELS[s])} variant="secondary" />
      </Row>
      <Row label="Programs">
        <BadgeList items={customer.activePrograms} variant="secondary" />
      </Row>
    </dl>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-label text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-body-sm">{children}</dd>
    </div>
  )
}

function BadgeList({ items, variant }: { items: string[]; variant: 'outline' | 'secondary' }) {
  if (items.length === 0) return <>—</>
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {items.map((item) => (
        <Badge key={item} variant={variant}>
          {item}
        </Badge>
      ))}
    </span>
  )
}
