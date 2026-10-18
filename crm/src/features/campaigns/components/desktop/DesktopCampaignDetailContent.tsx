import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { CampaignStatusBadge } from '@/features/campaigns/components/shared/CampaignStatusBadge'
import { updateCampaignStatus } from '@/features/campaigns/services/campaignService'
import { listCustomers } from '@/features/customers/services/customerService'
import type { Campaign } from '@/features/campaigns/types/campaign'

const ALL_CUSTOMERS_PAGE_SIZE = 1000

/**
 * docs/DESKTOP_UI_SPEC.md — denser multi-column layout. "Mark as Sent"
 * only ever transitions the mock status — it is never an actual send/
 * dispatch (no delivery channel/provider exists or is implied).
 * "Performance" shows only the real, derivable audience size; no
 * engagement metric (opens/clicks) exists in the mock data, so none is
 * shown as a number.
 */
export function DesktopCampaignDetailContent({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: customersResult } = useQuery({
    queryKey: ['customers', 'list', { search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' }],
    queryFn: () =>
      listCustomers({ search: '', page: 1, pageSize: ALL_CUSTOMERS_PAGE_SIZE, sortBy: 'name' }),
  })

  const audienceCustomers = (customersResult?.items ?? []).filter((c) =>
    campaign.audienceCustomerIds.includes(c.id),
  )

  const markAsSent = useMutation({
    mutationFn: () => updateCampaignStatus(campaign.id, 'sent'),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: () => setActionError('Could not update this campaign. Please try again.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{campaign.name}</h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        {campaign.status !== 'sent' && (
          <button
            type="button"
            onClick={() => markAsSent.mutate()}
            disabled={markAsSent.isPending}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
          >
            {markAsSent.isPending ? 'Updating…' : 'Mark as Sent'}
          </button>
        )}
      </div>

      {actionError && <p className="text-body-sm text-destructive">{actionError}</p>}

      <p className="max-w-md text-body-sm text-muted-foreground">
        "Sent" marks this campaign as sent in mock data only — no message is actually dispatched to
        any customer. No delivery channel or marketing provider is connected yet.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardSectionHeading>Schedule</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-body-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled for</span>
              <span>
                {campaign.scheduledAt
                  ? new Date(campaign.scheduledAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Not scheduled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>
                {new Date(campaign.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Audience</CardSectionHeading>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-body-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audience size</span>
              <span className="font-medium">{campaign.audienceCustomerIds.length}</span>
            </div>
            <p className="text-caption text-muted-foreground">
              Selected individually — no customer segment/tag model exists yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardSectionHeading>Performance</CardSectionHeading>
          </CardHeader>
          <CardContent className="text-body-sm text-muted-foreground">
            Not yet available — no engagement/delivery data model exists yet.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardSectionHeading>Message</CardSectionHeading>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-body-sm">{campaign.message}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardSectionHeading>Audience ({audienceCustomers.length})</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {audienceCustomers.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">No customers selected.</p>
          ) : (
            audienceCustomers.map((c) => (
              <Link
                key={c.id}
                to={`/customers/${c.id}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-sm hover:bg-accent"
              >
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.phone}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
