import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { MessagePreview } from '@/features/campaigns/components/shared/MessagePreview'
import { getCampaignPreview, sendTestMessage } from '@/features/campaigns/services/campaignService'
import { useSettingsGeneral } from '@/features/settings/hooks/useSettingsGeneral'
import { MESSAGE_CHANNEL_LABELS } from '@/features/settings/types/settings'
import type { CampaignSummary } from '@/features/campaigns/types/campaign'

/**
 * Book 3 §4 "send preview + test-send-to-self before broadcasting". The
 * preview uses a real audience member's details. The test is simulated
 * (no provider) and is shown only while the campaign is unsent.
 */
export function CampaignPreviewCard({ campaign }: { campaign: CampaignSummary }) {
  const general = useSettingsGeneral()
  // Null until edited, so the business contact phone shows as the default once it loads.
  const [phoneInput, setPhoneInput] = useState<string | null>(null)
  const phone = phoneInput ?? general.data?.contactPhone ?? ''
  const preview = useQuery({
    queryKey: ['campaigns', 'preview', campaign.id, campaign.message, campaign.status],
    queryFn: () => getCampaignPreview(campaign.id),
  })
  const testSend = useMutation({ mutationFn: () => sendTestMessage(campaign.id, phone) })

  return (
    <Card>
      <CardHeader>
        <CardSectionHeading>Preview{campaign.status !== 'sent' && ' & test'}</CardSectionHeading>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        {preview.isError ? (
          <p className="text-body-sm text-destructive">Couldn't load the preview.</p>
        ) : !preview.data ? (
          <p className="text-body-sm text-muted-foreground">Loading preview…</p>
        ) : (
          <MessagePreview
            text={preview.data.text}
            caption={
              preview.data.sampleCustomerName
                ? `As ${preview.data.sampleCustomerName} would see it.`
                : 'Nobody is in this audience yet, so a placeholder name is shown.'
            }
          />
        )}

        {campaign.status !== 'sent' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="test-phone" className="text-body-sm font-medium">
              Send yourself a test
            </label>
            <div className="flex gap-2">
              <Input
                id="test-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhoneInput(e.target.value)
                  testSend.reset()
                }}
                placeholder="+91 98765 43210"
                aria-invalid={testSend.isError}
              />
              <button
                type="button"
                onClick={() => testSend.mutate()}
                disabled={testSend.isPending || phone.trim() === ''}
                className={buttonVariants({ variant: 'outline', size: 'default' })}
              >
                <Send className="size-4" />
                {testSend.isPending ? 'Sending…' : 'Send test'}
              </button>
            </div>
            {testSend.isError && (
              <p className="text-caption text-destructive">
                {testSend.error instanceof Error ? testSend.error.message : 'Could not send the test.'}
              </p>
            )}
            {testSend.data && (
              <p className="text-caption text-success">
                Test sent to {testSend.data.to} by {MESSAGE_CHANNEL_LABELS[testSend.data.channel]} (simulated).
              </p>
            )}
            <p className="text-caption text-muted-foreground">
              Goes only to this number, not to customers, and doesn't count toward anyone's weekly limit. No messaging
              provider is connected yet, so nothing is actually delivered.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
