import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { KpiCard } from '@/components/shared/KpiCard'
import { SearchInput } from '@/components/shared/SearchInput'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMessageSummary, useMessages } from '@/features/notifications/hooks/useMessages'
import { AttemptPath, MessageErrorState, MessageStatusBadge } from '@/features/notifications/components/shared/MessageParts'
import { MESSAGE_STATUS_LABELS, SOURCE_TYPE_LABELS } from '@/features/notifications/utils/messageFormat'
import { useMessagingRules } from '@/features/settings/hooks/useMessagingRules'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import type { MessageStatus } from '@/features/notifications/types/message'

const COLUMN_COUNT = 5

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * Message Log — Book 3 §13 delivery status tracking. Every message any
 * engine asked to send, the channels tried in order, and the outcome,
 * including messages held back by the weekly limit. Simulated: no
 * provider is connected.
 */
export function DesktopMessageLogContent() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<MessageStatus | 'all'>('all')
  const debouncedSearch = useDebouncedValue(search)
  const { data, isPending, isError, refetch } = useMessages({ search: debouncedSearch, status })
  const summary = useMessageSummary()
  const rules = useMessagingRules()
  const items = data ?? []

  const enabledChannels = (rules.data?.channelOrder ?? [])
    .filter((c) => c.enabled)
    .map((c) => MESSAGE_CHANNEL_LABELS[c.channel])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">Message Log</h1>
        <DemoDataBadge />
      </div>

      <p className="max-w-3xl text-body-sm text-muted-foreground">
        {rules.data ? (
          <>
            Each customer gets at most <strong>{rules.data.weeklyCapPerCustomer}</strong> messages a week across all
            campaigns and programs. Channels are tried in this order: {enabledChannels.join(' → ')}, then the message is
            only logged.{' '}
          </>
        ) : (
          'Loading messaging rules… '
        )}
        <Link to="/settings/notifications" className="font-medium text-foreground underline underline-offset-2">
          Change in Settings
        </Link>
        . No messaging provider is connected yet, so these sends are simulated.
      </p>

      <div className="grid grid-cols-5 gap-4">
        {summary.data
          ? [
              { id: 'total', label: 'Messages', value: String(summary.data.total) },
              { id: 'reached', label: 'Reached customer', value: String(summary.data.reached) },
              { id: 'fallback', label: 'Used a fallback', value: String(summary.data.usedFallback) },
              { id: 'blocked', label: 'Blocked by weekly limit', value: String(summary.data.blocked) },
              { id: 'log-only', label: 'Logged only', value: String(summary.data.logOnly) },
            ].map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))
          : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <SearchInput
            id="message-search"
            label="Search messages"
            placeholder="Search by customer or source…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <select
          aria-label="Filter by status"
          className={selectClassName}
          value={status}
          onChange={(e) => setStatus(e.target.value as MessageStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {(Object.keys(MESSAGE_STATUS_LABELS) as MessageStatus[]).map((s) => (
            <option key={s} value={s}>
              {MESSAGE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <MessageErrorState onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <MessagesSquare className="size-8 text-muted-foreground" />
              <p className="text-body font-medium">
                {debouncedSearch || status !== 'all' ? 'No messages match these filters.' : 'No messages yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Channels tried</TableHead>
                  <TableHead>Status</TableHead>
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
                  : items.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(message.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </TableCell>
                        <TableCell>
                          <Link to={`/customers/${message.customerId}`} className="font-medium hover:underline">
                            {message.customerName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <p>{message.source.name}</p>
                          <p className="text-caption text-muted-foreground">{SOURCE_TYPE_LABELS[message.source.type]}</p>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <AttemptPath attempts={message.attempts} />
                        </TableCell>
                        <TableCell>
                          <MessageStatusBadge status={message.status} />
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
