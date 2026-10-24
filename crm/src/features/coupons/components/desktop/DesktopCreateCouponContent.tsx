import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { useCreateCoupon } from '@/features/coupons/hooks/useCoupons'
import { couponSchema, toCreateCouponInput, type CouponFormValues } from '@/features/coupons/schemas/couponSchema'
import {
  CHANNEL_LABELS,
  COUPON_CHANNELS,
  MAX_BULK_CODES,
  formatDiscount,
  normalizeCode,
  todayLocal,
} from '@/features/coupons/utils/couponRules'
import { formatCalendarDate } from '@/features/customers/utils/customerFormat'
import { cn } from '@/lib/utils'

const selectClassName =
  'h-8 rounded-lg border border-input bg-transparent px-2.5 text-body-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const DEFAULT_VALUES: CouponFormValues = {
  name: '',
  discountType: 'percent',
  discountValue: '',
  codeMode: 'shared',
  code: '',
  bulkPrefix: '',
  bulkCount: '50',
  totalUsageLimit: '',
  perCustomerLimit: '1',
  expiresOn: '',
  channel: 'whatsapp',
}

/**
 * Coupon Builder — Book 3 §12 simple version: code (one shared code or
 * many generated single-use codes), discount, usage limits, expiry and
 * distribution channel. A summary on the right reads the coupon back in
 * plain words before it is created. Nothing here sends codes to
 * customers or discounts a real order.
 */
export function DesktopCreateCouponContent() {
  const navigate = useNavigate()
  const createCoupon = useCreateCoupon()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CouponFormValues>({ resolver: zodResolver(couponSchema), defaultValues: DEFAULT_VALUES })

  const values = useWatch({ control }) as CouponFormValues
  const isBulk = values.codeMode === 'bulk'
  const discountValid = /^\d+$/.test(values.discountValue ?? '') && Number(values.discountValue) > 0

  const onSubmit = handleSubmit((v) => {
    createCoupon.mutate(toCreateCouponInput(v), {
      onSuccess: (coupon) => navigate(`/campaigns/coupons/${coupon.id}`),
    })
  })

  const exampleCode = isBulk
    ? `${normalizeCode(values.bulkPrefix ?? '') ? `${normalizeCode(values.bulkPrefix)}-` : ''}7K2QXM`
    : normalizeCode(values.code ?? '') || '—'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">New coupon</h1>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coupon</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Field id="coupon-name" label="Coupon name" error={errors.name?.message}>
              <Input id="coupon-name" placeholder="e.g. Weekend family offer" {...register('name')} aria-invalid={!!errors.name} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="coupon-discount-type" label="Discount type">
                <select id="coupon-discount-type" className={selectClassName} {...register('discountType')}>
                  <option value="percent">Percentage off</option>
                  <option value="flat">Flat amount off (₹)</option>
                </select>
              </Field>
              <Field id="coupon-discount-value" label="Discount" error={errors.discountValue?.message}>
                <div className="flex items-center gap-1.5">
                  {values.discountType === 'flat' && <span className="text-body-sm text-muted-foreground">₹</span>}
                  <Input
                    id="coupon-discount-value"
                    inputMode="numeric"
                    {...register('discountValue')}
                    aria-invalid={!!errors.discountValue}
                  />
                  {values.discountType === 'percent' && <span className="text-body-sm text-muted-foreground">%</span>}
                </div>
              </Field>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-body-sm font-medium">Codes</legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['shared', 'One shared code', 'Same code for everyone, e.g. on a flyer'],
                    ['bulk', 'Unique codes', 'Many single-use codes, e.g. for a partner'],
                  ] as const
                ).map(([mode, title, hint]) => (
                  <label
                    key={mode}
                    className={cn(
                      'flex cursor-pointer gap-2 rounded-lg border p-2.5',
                      values.codeMode === mode ? 'border-brand-primary bg-brand-primary-soft' : 'border-border',
                    )}
                  >
                    <input type="radio" value={mode} className="mt-0.5 accent-brand-primary" {...register('codeMode')} />
                    <span>
                      <span className="block text-body-sm font-medium">{title}</span>
                      <span className="block text-caption text-muted-foreground">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {isBulk ? (
              <div className="grid grid-cols-2 gap-4">
                <Field id="coupon-bulk-prefix" label="Code prefix (optional)" error={errors.bulkPrefix?.message}>
                  <Input
                    id="coupon-bulk-prefix"
                    placeholder="e.g. CAMPUS"
                    className="uppercase"
                    {...register('bulkPrefix')}
                    aria-invalid={!!errors.bulkPrefix}
                  />
                </Field>
                <Field id="coupon-bulk-count" label="How many codes" error={errors.bulkCount?.message}>
                  <Input
                    id="coupon-bulk-count"
                    inputMode="numeric"
                    {...register('bulkCount')}
                    aria-invalid={!!errors.bulkCount}
                  />
                </Field>
                <p className="col-span-2 text-caption text-muted-foreground">
                  Each code works once, for one customer. Up to {MAX_BULK_CODES} codes.
                </p>
              </div>
            ) : (
              <>
                <Field id="coupon-code" label="Code" error={errors.code?.message}>
                  <Input
                    id="coupon-code"
                    placeholder="e.g. WEEKEND20"
                    className="uppercase"
                    {...register('code')}
                    aria-invalid={!!errors.code}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="coupon-total-limit" label="Total uses (optional)" error={errors.totalUsageLimit?.message}>
                    <Input
                      id="coupon-total-limit"
                      inputMode="numeric"
                      placeholder="No limit"
                      {...register('totalUsageLimit')}
                      aria-invalid={!!errors.totalUsageLimit}
                    />
                  </Field>
                  <Field id="coupon-per-customer" label="Uses per customer" error={errors.perCustomerLimit?.message}>
                    <Input
                      id="coupon-per-customer"
                      inputMode="numeric"
                      {...register('perCustomerLimit')}
                      aria-invalid={!!errors.perCustomerLimit}
                    />
                  </Field>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field id="coupon-expires" label="Valid until" error={errors.expiresOn?.message}>
                <Input
                  id="coupon-expires"
                  type="date"
                  min={todayLocal()}
                  {...register('expiresOn')}
                  aria-invalid={!!errors.expiresOn}
                />
              </Field>
              <Field id="coupon-channel" label="Shared through">
                <select id="coupon-channel" className={selectClassName} {...register('channel')}>
                  {COUPON_CHANNELS.map((channel) => (
                    <option key={channel} value={channel}>
                      {CHANNEL_LABELS[channel]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {createCoupon.isError && (
              <p className="text-caption text-destructive">
                {createCoupon.error instanceof Error && createCoupon.error.message.includes('already in use')
                  ? createCoupon.error.message
                  : 'Could not create this coupon. Please try again.'}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/campaigns/coupons" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Cancel
            </Link>
            <button
              type="button"
              onClick={onSubmit}
              disabled={createCoupon.isPending}
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              {createCoupon.isPending ? 'Creating…' : 'Create coupon'}
            </button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-body-sm">
            <p className="rounded-lg border border-dashed border-border py-3 text-center font-mono text-h3 font-semibold tracking-wider">
              {exampleCode}
            </p>
            {isBulk && <p className="text-center text-caption text-muted-foreground">Example — codes are generated on create</p>}
            <ul className="flex flex-col gap-1.5">
              <li>
                {discountValid
                  ? formatDiscount({ discountType: values.discountType, discountValue: Number(values.discountValue) })
                  : 'Discount not set yet'}
              </li>
              <li>
                {isBulk
                  ? `${values.bulkCount || '—'} codes, each usable once`
                  : `${values.totalUsageLimit ? `${values.totalUsageLimit} uses in total` : 'No total limit'}, ${
                      values.perCustomerLimit || '—'
                    } per customer`}
              </li>
              <li>{values.expiresOn ? `Valid until ${formatCalendarDate(values.expiresOn)}` : 'Expiry date not set yet'}</li>
              <li>Shared through {CHANNEL_LABELS[values.channel]}</li>
            </ul>
            <p className="border-t border-border pt-3 text-caption text-muted-foreground">
              Creating a coupon doesn't send it to anyone. Redemptions will come from the POS once it's connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  )
}
