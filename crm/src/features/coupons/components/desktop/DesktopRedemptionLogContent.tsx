import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { CouponErrorState, CouponTabs } from '@/features/coupons/components/shared/CouponParts'
import { RedemptionTable } from '@/features/coupons/components/shared/RedemptionTable'
import { useRedemptions } from '@/features/coupons/hooks/useCoupons'
import { formatRupees } from '@/features/customers/utils/customerFormat'

/** Redemption Log — Book 3 §12. Every coupon redemption, newest first. */
export function DesktopRedemptionLogContent() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const { data, isPending, isError, refetch } = useRedemptions({ search: debouncedSearch })
  const items = data ?? []
  const totalDiscount = items.reduce((sum, r) => sum + r.discountAmount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-page-title font-semibold">Coupons</h1>
        <DemoDataBadge />
      </div>

      <CouponTabs />

      <div className="flex items-center justify-between gap-3">
        <div className="w-72">
          <SearchInput
            id="redemption-search"
            label="Search redemptions"
            placeholder="Search by code or customer…"
            value={search}
            onChange={setSearch}
          />
        </div>
        {!isPending && !isError && (
          <p className="text-body-sm text-muted-foreground">
            {items.length} redemption{items.length === 1 ? '' : 's'} · {formatRupees(totalDiscount)} in discounts
          </p>
        )}
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <CouponErrorState message="Couldn't load redemptions" onRetry={() => refetch()} />
          ) : !isPending && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Receipt className="size-8 text-muted-foreground" />
              <p className="text-body font-medium">
                {debouncedSearch ? `No redemptions match "${debouncedSearch}".` : 'No coupons have been redeemed yet.'}
              </p>
            </div>
          ) : (
            <RedemptionTable items={items} isLoading={isPending} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
