import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { useMergeCustomers, useMergePreview } from '@/features/customers/hooks/useCustomerTools'
import {
  MERGE_FIELD_LABELS,
  combineCustomers,
  type MergeChoices,
} from '@/features/customers/utils/customerMerge'
import { formatRupees, formatTimestampDate } from '@/features/customers/utils/customerFormat'

/**
 * Book 3 §1 Merge Tool, step 2: review and confirm. Every field where the
 * two records disagree needs an explicit choice before Merge is enabled
 * (never overwritten silently); the result is previewed before saving.
 */
export function DesktopMergeContent() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const primaryId = params.get('primary') ?? ''
  const secondaryId = params.get('secondary') ?? ''
  const preview = useMergePreview(primaryId, secondaryId)
  const merge = useMergeCustomers()
  const [choices, setChoices] = useState<MergeChoices>({})

  const swap = () => {
    setChoices({})
    setParams({ primary: secondaryId, secondary: primaryId }, { replace: true })
  }

  if (preview.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-body font-medium">
          {preview.error instanceof Error ? preview.error.message : 'These customers can’t be merged.'}
        </p>
        <Link to="/customers/duplicates" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Back to duplicates
        </Link>
      </div>
    )
  }
  if (preview.isPending) return <Skeleton className="h-64 w-full" />

  const { primary, secondary, conflicts } = preview.data
  const unresolved = conflicts.filter((c) => !choices[c.field]).length
  const result = unresolved === 0 ? combineCustomers(primary, secondary, choices) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">Merge customers</h1>
        <DemoDataBadge />
      </div>

      <div className="flex items-center gap-3 text-body-sm">
        <span>
          Keep <strong>{primary.name}</strong> and merge <strong>{secondary.name}</strong> into it.
        </span>
        <button type="button" onClick={swap} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeftRight className="size-4" />
          Swap
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>
            {conflicts.length === 0 ? 'No conflicting details' : `Choose what to keep (${unresolved} left)`}
          </CardSectionHeading>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">The two records don't disagree on any detail.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Detail</TableHead>
                  <TableHead>{primary.name} (kept)</TableHead>
                  <TableHead>{secondary.name}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflicts.map((c) => (
                  <TableRow key={c.field}>
                    <TableCell className="font-medium">{MERGE_FIELD_LABELS[c.field]}</TableCell>
                    {(['primary', 'secondary'] as const).map((side) => (
                      <TableCell key={side}>
                        <label className="flex items-center gap-2 text-body-sm">
                          <input
                            type="radio"
                            name={`choice-${c.field}`}
                            className="accent-brand-primary"
                            checked={choices[c.field] === side}
                            onChange={() => setChoices((prev) => ({ ...prev, [c.field]: side }))}
                          />
                          {side === 'primary' ? c.primaryValue : c.secondaryValue}
                        </label>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardSectionHeading>After merging</CardSectionHeading>
        </CardHeader>
        <CardContent className="text-body-sm">
          {!result ? (
            <p className="text-muted-foreground">Choose a value for every detail above to see the merged record.</p>
          ) : (
            <dl className="grid grid-cols-4 gap-4">
              {[
                ['Name', result.name],
                ['Phone', result.phone],
                ['Orders', `${result.orderCount} (${primary.orderCount} + ${secondary.orderCount})`],
                ['Lifetime spend', formatRupees(result.lifetimeSpend)],
                ['Loyalty points', result.loyaltyPoints ?? '—'],
                ['First visit', formatTimestampDate(result.firstVisitAt)],
                ['Last order', formatTimestampDate(result.lastOrderAt)],
                ['Preferences', result.preferenceTags.join(', ') || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3">
          <p className="text-caption text-muted-foreground">
            {secondary.name} will be archived and linked to {primary.name}. Their past orders and messages move across
            once the backend is connected.
          </p>
          <div className="flex shrink-0 gap-2">
            <Link to="/customers/duplicates" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Cancel
            </Link>
            <button
              type="button"
              disabled={!result || merge.isPending}
              onClick={() =>
                merge.mutate(
                  { primaryId: primary.id, secondaryId: secondary.id, choices },
                  { onSuccess: (merged) => navigate(`/customers/${merged.id}`) },
                )
              }
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {merge.isPending ? 'Merging…' : 'Merge customers'}
            </button>
          </div>
        </CardFooter>
      </Card>
      {merge.isError && (
        <p className="text-body-sm text-destructive">
          {merge.error instanceof Error ? merge.error.message : 'Could not merge. Please try again.'}
        </p>
      )}
    </div>
  )
}
