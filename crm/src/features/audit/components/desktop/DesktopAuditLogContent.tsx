import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Download, ScrollText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { downloadCsv } from '@/utils/downloadCsv'
import { useAuditEntries } from '@/features/audit/hooks/useAuditEntries'
import { AUDIT_CATEGORY_LABELS, auditEntriesToCsv } from '@/features/audit/utils/auditFormat'
import type { AuditCategory } from '@/features/audit/types/audit'

const COLUMN_COUNT = 5

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Audit Log — Book 3 §14 basic action log: who changed what, and when,
 * plus customer data access. Read-only by design: there is no edit or
 * delete anywhere. Session-only mock; the real log must be written
 * server-side.
 */
export function DesktopAuditLogContent() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AuditCategory | 'all'>('all')
  const debouncedSearch = useDebouncedValue(search)
  const { data, isPending, isError, refetch } = useAuditEntries({ search: debouncedSearch, category })
  const entries = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Audit Log</h1>
          <DemoDataBadge />
        </div>
        <button
          type="button"
          onClick={() => downloadCsv('audit-log.csv', auditEntriesToCsv(entries))}
          disabled={entries.length === 0}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      <p className="max-w-3xl text-body-sm text-muted-foreground">
        Every change to settings, users, segments, coupons and campaigns, and every customer profile opened or
        exported. Entries can't be edited or deleted. Until sign-in exists, this session's actions are recorded as the
        demo user Arjun Nair (Owner).
      </p>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <SearchInput
            id="audit-search"
            label="Search audit log"
            placeholder="Search by person, action or item…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <select
          aria-label="Filter by category"
          className={selectClassName}
          value={category}
          onChange={(e) => setCategory(e.target.value as AuditCategory | 'all')}
        >
          <option value="all">All categories</option>
          {(Object.keys(AUDIT_CATEGORY_LABELS) as AuditCategory[]).map((c) => (
            <option key={c} value={c}>
              {AUDIT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertTriangle className="size-8 text-destructive" />
              <h2 className="text-section-title font-semibold">Couldn't load the audit log</h2>
              <button type="button" onClick={() => refetch()} className={buttonVariants({ variant: 'default' })}>
                Retry
              </button>
            </div>
          ) : !isPending && entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <ScrollText className="size-8 text-muted-foreground" />
              <p className="text-body font-medium">
                {debouncedSearch || category !== 'all' ? 'No entries match these filters.' : 'Nothing recorded yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : entries.map((entry) => (
                      <TableRow key={entry.id} className="align-top">
                        <TableCell className="whitespace-nowrap">
                          {new Date(entry.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{entry.actor.name}</p>
                          <p className="text-caption text-muted-foreground">{entry.actor.roleLabel}</p>
                        </TableCell>
                        <TableCell>
                          <p>{entry.action}</p>
                          <p className="text-caption text-muted-foreground">{AUDIT_CATEGORY_LABELS[entry.category]}</p>
                        </TableCell>
                        <TableCell>
                          {entry.target.href ? (
                            <Link to={entry.target.href} className="hover:underline">
                              {entry.target.label}
                            </Link>
                          ) : (
                            entry.target.label
                          )}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {entry.changes.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <ul className="flex flex-col gap-0.5 text-body-sm">
                              {entry.changes.map((change) => (
                                <li key={change.field}>
                                  <span className="text-muted-foreground">{change.field}: </span>
                                  {change.from !== '—' && (
                                    <>
                                      <span className="line-through decoration-muted-foreground/50">{change.from}</span>
                                      {' → '}
                                    </>
                                  )}
                                  <span className="font-medium">{change.to}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
