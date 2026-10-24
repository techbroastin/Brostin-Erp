import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { CampaignStatusBadge } from '@/features/campaigns/components/shared/CampaignStatusBadge'
import { sendCampaign } from '@/features/campaigns/services/campaignService'
import type { DispatchSummary } from '@/features/notifications/types/message'
import { useCampaignAudience } from '@/features/campaigns/hooks/useCampaignAudience'
import { CampaignPreviewCard } from '@/features/campaigns/components/desktop/CampaignPreviewCard'
import { CampaignPerformanceCard } from '@/features/campaigns/components/desktop/CampaignPerformanceCard'
import { Badge } from '@/components/ui/badge'
import type { Campaign, CampaignSummary } from '@/features/campaigns/types/campaign'
import { permissionMessage } from '@/features/auth/utils/permissionMessage'

/**
 * docs/DESKTOP_UI_SPEC.md — denser multi-column layout. "Mark as Sent"
 * routes each audience message through the Notification Engine
 * (simulated delivery — no provider is connected) and reports the
 * outcome; details are in the Message Log.
 * "Performance" shows only the real, derivable audience size; no
 * engagement metric (opens/clicks) exists in the mock data, so none is
 * shown as a number.
 */
export function DesktopCampaignDetailContent({ campaign }: { campaign: CampaignSummary }) {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<DispatchSummary | null>(null)
  const [nextYear, setNextYear] = useState<Campaign | null>(null)

  const { data: audienceCustomers = [], isPending: audiencePending } = useCampaignAudience(campaign.id)

  const markAsSent = useMutation({
    mutationFn: () => sendCampaign(campaign.id),
    onSuccess: (result) => {
      setActionError(null)
      setDelivery(result.delivery)
      setNextYear(result.nextYear)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: (error) =>
      setActionError(
        permissionMessage(error) ??
          (error instanceof Error && /segment|already been sent/.test(error.message)
            ? error.message
            : 'Could not send this campaign. Please try again.'),
      ),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{campaign.name}</h1>
          <CampaignStatusBadge status={campaign.status} />
          {campaign.isDue && <Badge variant="destructive">Due — not sent</Badge>}
        </div>
        {campaign.status !== 'sent' && (
          <button
            type="button"
            onClick={() => markAsSent.mutate()}
            disabled={markAsSent.isPending}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
          >
            {markAsSent.isPending ? 'Sending…' : 'Send now'}
          </button>
        )}
      </div>

      {actionError && <p className="text-body-sm text-destructive">{actionError}</p>}

      {campaign.isDue && (
        <p className="max-w-2xl rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm">
          This campaign was scheduled for{' '}
          {new Date(campaign.scheduledAt!).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} but
          hasn't gone out. No automatic sender is connected yet — use <strong>Send now</strong>.
        </p>
      )}

      {delivery && (
        <p className="max-w-2xl rounded-lg border border-border bg-muted/40 px-3 py-2 text-body-sm">
          {delivery.reached} of {delivery.total} customers reached
          {delivery.usedFallback > 0 && ` (${delivery.usedFallback} through a fallback channel)`}
          {delivery.blocked > 0 && ` · ${delivery.blocked} held back by the weekly limit`}
          {delivery.logOnly > 0 && ` · ${delivery.logOnly} logged only`}.{' '}
          <Link to="/campaigns/messages" className="font-medium underline underline-offset-2">
            View in Message Log
          </Link>
          {nextYear && (
            <>
              {' '}
              Next year's campaign is scheduled for{' '}
              <Link to={`/campaigns/${nextYear.id}`} className="font-medium underline underline-offset-2">
                {new Date(nextYear.scheduledAt!).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </Link>
              .
            </>
          )}
        </p>
      )}

      <p className="max-w-md text-body-sm text-muted-foreground">
        Sending goes through the Notification Engine, which applies the weekly limit, opt-outs and channel
        fallback. No messaging provider is connected yet, so delivery is simulated and no customer is contacted.
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
              <span className="text-muted-foreground">Repeats</span>
              <span>{campaign.repeatYearly ? 'Every year' : 'No'}</span>
            </div>
            {campaign.sentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent</span>
                <span>
                  {new Date(campaign.sentAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            )}
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
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Segment</span>
              {campaign.segmentName ? (
                <Link to={`/customers/segments/${campaign.segmentId}`} className="font-medium hover:underline">
                  {campaign.segmentName}
                </Link>
              ) : (
                <span className="text-destructive">Deleted</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{campaign.status === 'sent' ? 'Sent to' : 'Customers now'}</span>
              <span className="font-medium">{campaign.audienceCount}</span>
            </div>
            <p className="text-caption text-muted-foreground">
              {campaign.status === 'sent'
                ? 'Fixed when the campaign was sent.'
                : "Follows the segment's membership until the campaign is sent."}
            </p>
          </CardContent>
        </Card>

        <CampaignPerformanceCard campaign={campaign} />
      </div>

      <CampaignPreviewCard campaign={campaign} />

      <Card>
        <CardHeader>
          <CardSectionHeading>Audience{audiencePending ? '' : ` (${audienceCustomers.length})`}</CardSectionHeading>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {audiencePending ? (
            <p className="text-body-sm text-muted-foreground">Loading audience…</p>
          ) : audienceCustomers.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">No customers in this audience.</p>
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
