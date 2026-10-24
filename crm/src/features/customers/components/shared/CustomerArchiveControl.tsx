import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { useArchiveCustomer, useRestoreCustomer } from '@/features/customers/hooks/useCustomerTools'
import type { Customer } from '@/features/customers/types/customer'
import { cn } from '@/lib/utils'
import { permissionMessage } from '@/features/auth/utils/permissionMessage'

/**
 * Book 3 §1 archive — never delete. Shows the archived banner (with the
 * merged-into link when relevant) and an Archive / Restore control.
 * Works on phone and desktop; the reason step is inline, not a dialog.
 */
export function CustomerArchiveControl({ customer }: { customer: Customer }) {
  const [confirming, setConfirming] = useState(false)
  const [reason, setReason] = useState('')
  const archive = useArchiveCustomer()
  const restore = useRestoreCustomer()

  if (customer.archivedAt) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-body-sm">
        <p className="flex items-center gap-1.5 font-medium">
          <Archive className="size-4 shrink-0" />
          Archived {new Date(customer.archivedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          {customer.archiveReason && <span className="font-normal text-muted-foreground">— {customer.archiveReason}</span>}
        </p>
        <p className="text-muted-foreground">Hidden from customer lists, segments and campaigns. Its history is kept.</p>
        {customer.mergedIntoId ? (
          <Link to={`/customers/${customer.mergedIntoId}`} className="font-medium underline underline-offset-2">
            Open the customer it was merged into
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => restore.mutate(customer.id)}
            disabled={restore.isPending}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
          >
            {restore.isPending ? 'Restoring…' : 'Restore customer'}
          </button>
        )}
        {restore.isError && (
          <p className="text-caption text-destructive">
            {permissionMessage(restore.error) ?? 'Could not restore. Please try again.'}
          </p>
        )}
      </div>
    )
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
      >
        <Archive className="size-4" />
        Archive
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2">
      <label htmlFor="archive-reason" className="text-body-sm font-medium">
        Why archive this customer? (optional)
      </label>
      <Input
        id="archive-reason"
        value={reason}
        maxLength={200}
        placeholder="e.g. Moved away, asked to stop contact"
        onChange={(e) => setReason(e.target.value)}
      />
      <p className="text-caption text-muted-foreground">
        Archiving hides the customer everywhere but keeps their history. You can restore them later.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => archive.mutate({ id: customer.id, reason }, { onSuccess: () => setConfirming(false) })}
          disabled={archive.isPending}
          className={buttonVariants({ variant: 'destructive', size: 'sm' })}
        >
          {archive.isPending ? 'Archiving…' : 'Archive customer'}
        </button>
      </div>
      {archive.isError && (
        <p className="text-caption text-destructive">
          {permissionMessage(archive.error) ?? 'Could not archive. Please try again.'}
        </p>
      )}
    </div>
  )
}
