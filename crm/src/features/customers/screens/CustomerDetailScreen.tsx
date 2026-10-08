import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useCustomerDetail } from '@/features/customers/hooks/useCustomerDetail'
import { CustomerErrorState } from '@/features/customers/components/shared/CustomerErrorState'
import { MobileCustomerDetailContent } from '@/features/customers/components/mobile/MobileCustomerDetailContent'
import { DesktopCustomerDetailContent } from '@/features/customers/components/desktop/DesktopCustomerDetailContent'

export function CustomerDetailScreen() {
  const { customerId } = useParams<{ customerId: string }>()
  const isDesktop = useIsDesktopViewport()
  const { data: customer, isPending, isError, refetch } = useCustomerDetail(customerId ?? '')

  if (isError) {
    return (
      <div className={isDesktop ? '' : 'p-4'}>
        <CustomerErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className={isDesktop ? 'flex flex-col gap-4' : 'flex flex-col gap-4 p-4'}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div
        className={
          isDesktop
            ? 'flex flex-col items-center gap-2 py-16 text-center'
            : 'flex flex-col items-center gap-2 p-4 py-16 text-center'
        }
      >
        <p className="text-body font-medium">Customer not found.</p>
        <p className="text-body-sm text-muted-foreground">
          This customer record doesn't exist or may have been removed.
        </p>
      </div>
    )
  }

  return isDesktop ? (
    <DesktopCustomerDetailContent customer={customer} />
  ) : (
    <MobileCustomerDetailContent customer={customer} />
  )
}
