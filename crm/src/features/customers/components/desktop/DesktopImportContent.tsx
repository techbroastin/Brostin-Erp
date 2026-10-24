import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileUp } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { downloadCsv } from '@/utils/downloadCsv'
import { cn } from '@/lib/utils'
import { useImportCustomers, useImportPreview } from '@/features/customers/hooks/useCustomerTools'
import {
  IMPORT_COLUMNS,
  IMPORT_TEMPLATE_CSV,
  MAX_IMPORT_ROWS,
  type ImportRowStatus,
} from '@/features/customers/utils/customerImport'

const textareaClassName =
  'min-h-40 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-body-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const MAX_FILE_BYTES = 1024 * 1024

const STATUS_DISPLAY: Record<ImportRowStatus, { label: string; className: string }> = {
  new: { label: 'New customer', className: 'text-success' },
  update: { label: 'Update existing', className: 'text-info' },
  no_change: { label: 'Already up to date', className: 'text-muted-foreground' },
  duplicate_in_file: { label: 'Skipped', className: 'text-warning' },
  invalid: { label: 'Has errors', className: 'text-destructive' },
}

/**
 * Book 3 §1 Bulk Import: paste or upload a CSV, preview every row
 * (nothing is saved yet), then import. Existing customers (matched by
 * phone) only get blank fields filled; disagreeing values are flagged
 * for review, never overwritten.
 */
export function DesktopImportContent() {
  const [text, setText] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const preview = useImportPreview()
  const importRun = useImportCustomers()

  const resetResults = () => {
    preview.reset()
    importRun.reset()
  }

  const onFile = async (file: File | undefined) => {
    setFileError(null)
    resetResults()
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setFileError('That file is larger than 1 MB. Split it into smaller files.')
      return
    }
    setText(await file.text())
  }

  const rows = preview.data?.rows ?? []
  const counts = rows.reduce<Record<ImportRowStatus, number>>(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { new: 0, update: 0, no_change: 0, duplicate_in_file: 0, invalid: 0 },
  )
  const canImport =
    preview.data && preview.data.missingColumns.length === 0 && !preview.data.tooManyRows && counts.new + counts.update > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Import customers</h1>
          <DemoDataBadge />
        </div>
        <button
          type="button"
          onClick={() => downloadCsv('customer-import-template.csv', IMPORT_TEMPLATE_CSV)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Download className="size-4" />
          Download template
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>1. Add your file</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-body-sm text-muted-foreground">
            CSV with a header row. Columns: <code className="font-mono">{IMPORT_COLUMNS.join(', ')}</code>. Name and
            phone are required; dates as YYYY-MM-DD; opt-in as yes/no; tags separated by ";". Up to{' '}
            {MAX_IMPORT_ROWS.toLocaleString('en-IN')} rows.
          </p>
          <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer self-start')}>
            <FileUp className="size-4" />
            Choose CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                void onFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
          {fileError && <p className="text-caption text-destructive">{fileError}</p>}
          <label htmlFor="import-text" className="text-body-sm font-medium">
            …or paste it here
          </label>
          <textarea
            id="import-text"
            className={textareaClassName}
            value={text}
            placeholder={IMPORT_TEMPLATE_CSV}
            onChange={(e) => {
              setText(e.target.value)
              resetResults()
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <button
            type="button"
            disabled={!text.trim() || preview.isPending}
            onClick={() => preview.mutate(text)}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
          >
            {preview.isPending ? 'Checking…' : 'Check file'}
          </button>
        </CardFooter>
      </Card>

      {preview.isError && <p className="text-body-sm text-destructive">Couldn't check this file. Please try again.</p>}

      {preview.data && (
        <Card>
          <CardHeader>
            <CardSectionHeading>2. Review</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {preview.data.missingColumns.length > 0 ? (
              <p className="text-body-sm text-destructive">
                The header row is missing: {preview.data.missingColumns.join(', ')}.
              </p>
            ) : preview.data.tooManyRows ? (
              <p className="text-body-sm text-destructive">
                This file has more than {MAX_IMPORT_ROWS.toLocaleString('en-IN')} rows. Split it into smaller files.
              </p>
            ) : rows.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">The file has a header but no rows.</p>
            ) : (
              <>
                <p className="text-body-sm">
                  {counts.new} new · {counts.update} to update · {counts.no_change} already up to date ·{' '}
                  {counts.invalid + counts.duplicate_in_file} skipped. Nothing has been saved yet.
                </p>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Line</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.line} className="align-top">
                          <TableCell className="text-muted-foreground">{row.line}</TableCell>
                          <TableCell>{row.fields.name || '—'}</TableCell>
                          <TableCell className="font-mono text-body-sm">{row.fields.phone || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_DISPLAY[row.status].className}>
                              {STATUS_DISPLAY[row.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-normal text-body-sm">
                            {row.errors.length > 0 && <p className="text-destructive">{row.errors.join(' ')}</p>}
                            {row.matchCustomerId && (
                              <p>
                                Matches{' '}
                                <Link to={`/customers/${row.matchCustomerId}`} className="underline underline-offset-2">
                                  {row.matchCustomerName}
                                </Link>
                                {row.fills.length > 0 && <> · fills {row.fills.join(', ')}</>}
                              </p>
                            )}
                            {row.conflicts.length > 0 && (
                              <p className="text-warning">
                                Differs on {row.conflicts.join(', ')} — kept as is and flagged for review.
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3">
            {importRun.data ? (
              <p className="text-body-sm text-success">
                Imported: {importRun.data.created} created, {importRun.data.updated} updated
                {importRun.data.flagged > 0 && ` (${importRun.data.flagged} flagged for review)`}, {importRun.data.skipped}{' '}
                skipped.{' '}
                <Link to="/customers" className="font-medium underline underline-offset-2">
                  View customers
                </Link>
              </p>
            ) : (
              <p className="text-caption text-muted-foreground">Rows with errors are skipped. You can fix and re-import them.</p>
            )}
            <button
              type="button"
              disabled={!canImport || importRun.isPending || !!importRun.data}
              onClick={() => importRun.mutate(text)}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {importRun.isPending ? 'Importing…' : `Import ${counts.new + counts.update} rows`}
            </button>
          </CardFooter>
          {importRun.isError && (
            <p className="px-4 pb-4 text-body-sm text-destructive">Couldn't import this file. Please try again.</p>
          )}
        </Card>
      )}
    </div>
  )
}
