import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { PosConnectionStatusBadge } from '@/features/pos-integrations/components/shared/PosConnectionStatusBadge'
import { useTestPosConnection } from '@/features/pos-integrations/hooks/useTestPosConnection'
import { useSetPosConnectionDisabled } from '@/features/pos-integrations/hooks/useSetPosConnectionDisabled'
import { usePosSyncLogs } from '@/features/pos-integrations/hooks/usePosSyncLogs'
import {
  VENDOR_LABELS,
  AUTH_METHOD_LABELS,
  SYNC_ENTITY_LABELS,
  type PosConnection,
  type PosFieldMappingRow,
} from '@/features/pos-integrations/types/posIntegration'
import { cn } from '@/lib/utils'

const TABS = ['Overview', 'Field Mapping', 'Sync Logs', 'Danger Zone'] as const
type Tab = (typeof TABS)[number]

/**
 * Illustrative Order field names only — no real ManageMe/Petpooja
 * payload field names are confirmed anywhere (docs/CLAUDE.md §7: "do
 * not invent... business rules"). Never persisted; edits here are
 * local component state only, lost on navigating away.
 */
const DEFAULT_FIELD_MAPPING: PosFieldMappingRow[] = [
  { broastinField: 'orderNumber', vendorField: '' },
  { broastinField: 'status', vendorField: '' },
  { broastinField: 'grandTotal', vendorField: '' },
  { broastinField: 'customerName', vendorField: '' },
]

function formatDateTime(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString()
}

/**
 * Connection detail — docs/IMPLEMENTATION_PLAN.md §21 (Phase 18)
 * generalized per the approved Phase 18b multi-vendor scope. Tabs use
 * a plain button-group switcher (no new Tabs UI primitive introduced)
 * to match the project's existing component inventory.
 */
export function DesktopPosConnectionDetailContent({ connection }: { connection: PosConnection }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [fieldMapping, setFieldMapping] = useState(DEFAULT_FIELD_MAPPING)

  const testConnection = useTestPosConnection()
  const setDisabled = useSetPosConnectionDisabled()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{connection.label}</h1>
          <PosConnectionStatusBadge status={connection.status} />
        </div>
        <span className="text-body-sm text-muted-foreground">{VENDOR_LABELS[connection.vendor]}</span>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-2 text-body-sm font-medium',
              activeTab === tab
                ? 'border-b-2 border-brand-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <p className="text-body-sm text-muted-foreground">
            Status here reflects this connection's mock state only. No real ManageMe or Petpooja
            API has ever been called — Test Connection runs a deterministic mock adapter, never a
            live vendor request.
          </p>

          {testConnection.isError && (
            <p className="text-body-sm text-destructive">Could not test this connection. Please try again.</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardSectionHeading>Configuration</CardSectionHeading>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication</span>
                  <span>{AUTH_METHOD_LABELS[connection.authMethod]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sync mode</span>
                  <span>
                    {connection.syncMode === 'polling'
                      ? `Polling every ${connection.pollingIntervalMinutes ?? 0} min`
                      : 'Webhook'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardSectionHeading>Sync status</CardSectionHeading>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last successful sync</span>
                  <span>{formatDateTime(connection.lastSuccessfulSyncAt)}</span>
                </div>
                {connection.lastErrorMessage && (
                  <p className="text-caption text-destructive">{connection.lastErrorMessage}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <button
              type="button"
              onClick={() => testConnection.mutate(connection)}
              disabled={testConnection.isPending || connection.status === 'disabled'}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {testConnection.isPending ? 'Testing…' : 'Test Connection'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Field Mapping' && (
        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="text-body-sm text-muted-foreground">
            Illustrative mapping only — no real {VENDOR_LABELS[connection.vendor]} payload field
            names are confirmed yet. Edits here are not persisted beyond this page view.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-3 text-caption font-medium text-muted-foreground">
                <span>Broastin field</span>
                <span>{VENDOR_LABELS[connection.vendor]} field</span>
              </div>
              {fieldMapping.map((row, index) => (
                <div key={row.broastinField} className="grid grid-cols-2 gap-3">
                  <span className="flex items-center text-body-sm">{row.broastinField}</span>
                  <input
                    type="text"
                    placeholder="Not yet mapped"
                    value={row.vendorField}
                    onChange={(e) =>
                      setFieldMapping((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, vendorField: e.target.value } : r)),
                      )
                    }
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'Sync Logs' && <SyncLogsPanel connectionId={connection.id} />}

      {activeTab === 'Danger Zone' && (
        <div className="flex flex-col gap-3 max-w-2xl">
          <Card>
            <CardHeader>
              <CardSectionHeading>
                {connection.status === 'disabled' ? 'Reconnect' : 'Disable connection'}
              </CardSectionHeading>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-body-sm">
              <p className="text-muted-foreground">
                {connection.status === 'disabled'
                  ? 'Reconnecting only resets this mock connection to Pending — it does not re-verify credentials. Run Test Connection afterward.'
                  : 'Disabling stops this mock connection from being treated as active. No real sync, polling, or webhook delivery is ever running to stop.'}
              </p>
              {setDisabled.isError && (
                <p className="text-caption text-destructive">Could not update this connection. Please try again.</p>
              )}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setDisabled.mutate({ id: connection.id, disabled: connection.status !== 'disabled' })
                  }
                  disabled={setDisabled.isPending}
                  className={buttonVariants({
                    variant: connection.status === 'disabled' ? 'default' : 'destructive',
                    size: 'sm',
                  })}
                >
                  {setDisabled.isPending
                    ? 'Updating…'
                    : connection.status === 'disabled'
                      ? 'Reconnect'
                      : 'Disable'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function SyncLogsPanel({ connectionId }: { connectionId: string }) {
  const { data, isPending, isError, refetch } = usePosSyncLogs(connectionId)
  const logs = data ?? []

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-body-sm text-destructive">Couldn't load sync logs.</p>
        <button type="button" onClick={() => refetch()} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Retry
        </button>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2 max-w-2xl">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (logs.length === 0) {
    return <p className="py-12 text-center text-body-sm text-muted-foreground">No sync runs yet.</p>
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col divide-y divide-border">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 text-body-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{SYNC_ENTITY_LABELS[log.entityType]}</span>
              <span className="text-caption text-muted-foreground">{new Date(log.startedAt).toLocaleString()}</span>
              {log.errorMessage && <span className="text-caption text-destructive">{log.errorMessage}</span>}
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span
                className={cn(
                  'text-caption font-medium',
                  log.status === 'success'
                    ? 'text-success'
                    : log.status === 'partial'
                      ? 'text-warning'
                      : 'text-destructive',
                )}
              >
                {log.status === 'success' ? 'Success' : log.status === 'partial' ? 'Partial' : 'Failed'}
              </span>
              <span className="text-caption text-muted-foreground">
                {log.recordsProcessed} processed{log.recordsFailed > 0 ? `, ${log.recordsFailed} failed` : ''}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
