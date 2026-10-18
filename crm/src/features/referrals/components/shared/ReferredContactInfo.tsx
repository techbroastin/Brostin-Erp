import { Link } from 'react-router-dom'
import { Phone, UserCheck, UserPlus } from 'lucide-react'
import type { ReferredContact } from '@/features/referrals/types/referral'
import { cn } from '@/lib/utils'

/**
 * Shared by desktop table cells and mobile cards. A registered referred
 * contact links to the existing Customer Detail screen (/customers/:id)
 * — no new route, no duplicated identity. An unregistered contact is
 * plain text with its own mock contact details; it never links anywhere
 * and is never shown as a Customer record. Registration state is paired
 * with icon + text + color, never color alone.
 */
export function ReferredContactInfo({ referred }: { referred: ReferredContact }) {
  return (
    <div className="flex flex-col gap-0.5">
      {referred.registered ? (
        <Link
          to={`/customers/${referred.customerId}`}
          className="text-body-sm font-medium underline-offset-4 hover:underline"
        >
          {referred.name}
        </Link>
      ) : (
        <span className="text-body-sm font-medium">{referred.name}</span>
      )}
      <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Phone className="size-3 shrink-0" />
        {referred.phone}
      </span>
      <span
        className={cn(
          'flex items-center gap-1 text-caption',
          referred.registered ? 'text-success' : 'text-muted-foreground',
        )}
      >
        {referred.registered ? (
          <UserCheck className="size-3 shrink-0" />
        ) : (
          <UserPlus className="size-3 shrink-0" />
        )}
        {referred.registered ? 'Registered customer' : 'Not registered'}
      </span>
    </div>
  )
}
