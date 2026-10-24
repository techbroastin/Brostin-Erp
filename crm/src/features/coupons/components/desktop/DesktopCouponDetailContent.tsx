import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { CardSectionHeading } from '@/components/shared/CardSectionHeading'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CouponStatusBadge } from '@/features/coupons/components/shared/CouponParts'
import { RedemptionTable } from '@/features/coupons/components/shared/RedemptionTable'
import { useSetCouponDisabled } from '@/features/coupons/hooks/useCoupons'
import { CHANNEL_LABELS, couponCodesToCsv, formatDiscount, usedCodes } from '@/features/coupons/utils/couponRules'
import { formatCalendarDate, formatTimestampDate } from '@/features/customers/utils/customerFormat'
import { downloadCsv } from '@/utils/downloadCsv'
import type { CouponDetail } from '@/features/coupons/types/coupon'
import { cn } from '@/lib/utils'

/**
 * Coupon detail — settings, codes and this coupon's redemptions.
 * Disable/enable is reversible and never removes past redemptions.
 */
export function DesktopCouponDetailContent({ detail }: { detail: CouponDetail }) {
  const { coupon, redemptions } = detail
  const setDisabled = useSetCouponDisabled(coupon.id)
  const used = usedCodes(redemptions)

  const onDownload = () => {
    const safeName = coupon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadCsv(`${safeName}-codes.csv`, couponCodesToCsv(coupon, redemptions))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">{coupon.name}</h1>
          <CouponStatusBadge status={coupon.status} />
          <DemoDataBadge />
        </div>
        <button
          type="button"
          onClick={() => setDisabled.mutate(!coupon.disabled)}
          disabled={setDisabled.isPending}
          className={buttonVariants({ variant: coupon.disabled ? 'default' : 'outline', size: 'sm' })}
        >
          {setDisabled.isPending ? 'Saving…' : coupon.disabled ? 'Enable coupon' : 'Disable coupon'}
        </button>
      </div>
      {setDisabled.isError && (
        <p className="text-caption text-destructive">Could not update this coupon. Please try again.</p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardSectionHeading>Details</CardSectionHeading>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-body-sm">
                <Row label="Discount">{formatDiscount(coupon)}</Row>
                <Row label="Code type">{coupon.codeMode === 'shared' ? 'One shared code' : 'Unique single-use codes'}</Row>
                <Row label="Used">
                  {coupon.redemptionCount}
                  {coupon.totalUsageLimit !== null ? ` of ${coupon.totalUsageLimit}` : ' (no total limit)'}
                </Row>
                <Row label="Per customer">
                  {coupon.perCustomerLimit} use{coupon.perCustomerLimit === 1 ? '' : 's'}
                </Row>
                <Row label="Valid until">{formatCalendarDate(coupon.expiresOn)}</Row>
                <Row label="Channel">{CHANNEL_LABELS[coupon.channel]}</Row>
                <Row label="Created">{formatTimestampDate(coupon.createdAt)}</Row>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardSectionHeading>{coupon.codeMode === 'shared' ? 'Code' : `Codes (${coupon.codes.length})`}</CardSectionHeading>
              {coupon.codeMode === 'bulk' && (
                <button type="button" onClick={onDownload} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  <Download className="size-4" />
                  Download CSV
                </button>
              )}
            </CardHeader>
            <CardContent>
              {coupon.codeMode === 'shared' ? (
                <p className="rounded-lg border border-dashed border-border py-3 text-center font-mono text-h3 font-semibold tracking-wider">
                  {coupon.codes[0]}
                </p>
              ) : (
                <ul className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto font-mono text-body-sm">
                  {coupon.codes.map((code) => (
                    <li
                      key={code}
                      className={cn(
                        'rounded-md border border-border px-2 py-1',
                        used.has(code) && 'text-muted-foreground line-through',
                      )}
                      title={used.has(code) ? 'Used' : 'Unused'}
                    >
                      {code}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardSectionHeading>Redemptions</CardSectionHeading>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <p className="py-12 text-center text-body-sm text-muted-foreground">
                This coupon hasn't been redeemed yet.
              </p>
            ) : (
              <RedemptionTable items={redemptions} showCoupon={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}
