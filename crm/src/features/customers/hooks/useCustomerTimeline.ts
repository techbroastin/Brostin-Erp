import { useQuery } from '@tanstack/react-query'
import { getCustomerTimeline } from '@/features/customers/services/customerTimelineService'

export const customerTimelineQueryKey = (customerId: string) => ['customers', 'timeline', customerId] as const

export function useCustomerTimeline(customerId: string) {
  return useQuery({
    queryKey: customerTimelineQueryKey(customerId),
    queryFn: () => getCustomerTimeline(customerId),
    enabled: !!customerId,
  })
}
