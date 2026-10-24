import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { listCustomers } from '@/features/customers/services/customerService'
import { useSimulateVisit } from '@/features/programs/hooks/usePrograms'
import type { ProgramOutcome } from '@/features/programs/types/program'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const ALL_CUSTOMERS = { search: '', page: 1, pageSize: 1000, sortBy: 'name' } as const

const RESULT_STYLE: Record<ProgramOutcome['result'], { label: string; className: string }> = {
  applies: { label: 'Applies', className: 'text-success' },
  excluded: { label: "Can't combine", className: 'text-warning' },
  not_eligible: { label: 'Not eligible', className: 'text-muted-foreground' },
  not_triggered: { label: 'Not this visit', className: 'text-muted-foreground' },
}

/**
 * "Try a visit" — which active programs would reward a customer on a
 * visit like this, including "can't combine" rules. Nothing is awarded
 * or sent; real visits arrive with the POS/QR order feed.
 */
export function TryVisitCard() {
  const customers = useQuery({ queryKey: ['customers', 'list', ALL_CUSTOMERS], queryFn: () => listCustomers(ALL_CUSTOMERS) })
  const [customerId, setCustomerId] = useState('')
  const [orderValue, setOrderValue] = useState('800')
  const [visitNumber, setVisitNumber] = useState('5')
  const [isBirthday, setIsBirthday] = useState(false)
  const simulate = useSimulateVisit()
  const valid = !!customerId && /^\d+$/.test(orderValue) && /^\d+$/.test(visitNumber) && Number(visitNumber) >= 1

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>Try a visit</CardSectionHeading>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3 text-body-sm">
          <label className="flex flex-col gap-1.5">
            <span className="font-medium">Customer</span>
            <select
              aria-label="Customer"
              className={selectClassName}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value)
                simulate.reset()
              }}
            >
              <option value="">{customers.isPending ? 'Loading customers…' : 'Choose a customer…'}</option>
              {(customers.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-medium">Order value (₹)</span>
              <Input aria-label="Order value" inputMode="numeric" className="w-28" value={orderValue} onChange={(e) => setOrderValue(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-medium">Visit number</span>
              <Input aria-label="Visit number" inputMode="numeric" className="w-24" value={visitNumber} onChange={(e) => setVisitNumber(e.target.value)} />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-brand-primary" checked={isBirthday} onChange={(e) => setIsBirthday(e.target.checked)} />
            It's their birthday
          </label>
          <button
            type="button"
            disabled={!valid || simulate.isPending}
            onClick={() =>
              simulate.mutate({ customerId, orderValue: Number(orderValue), visitNumber: Number(visitNumber), isBirthday })
            }
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'self-start')}
          >
            {simulate.isPending ? 'Checking…' : 'Check programs'}
          </button>
          <p className="text-caption text-muted-foreground">
            Shows which active programs would reward this visit. Nothing is awarded or sent.
          </p>
        </div>
        <div aria-live="polite" className="flex flex-col gap-2 text-body-sm">
          {simulate.isError && <p className="text-destructive">Couldn't check this visit. Please try again.</p>}
          {!simulate.data ? (
            <p className="text-muted-foreground">Results show here.</p>
          ) : simulate.data.length === 0 ? (
            <p className="text-muted-foreground">No programs are active.</p>
          ) : (
            simulate.data.map((o) => (
              <div key={o.programId} className="rounded-lg border border-border px-3 py-2">
                <p className="flex items-center justify-between gap-2 font-medium">
                  {o.programName}
                  <span className={cn('text-caption', RESULT_STYLE[o.result].className)}>{RESULT_STYLE[o.result].label}</span>
                </p>
                <p className="text-muted-foreground">{o.detail}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
