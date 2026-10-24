import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCustomerTimeline, listCustomerActivity } from '@/features/customers/services/customerTimelineService'
import type { CustomerTimelineEventFilter } from '@/features/customers/types/customerTimeline'

export const customerTimelineQueryKey = (customerId: string) => ['customers', 'timeline', customerId] as const

export function useCustomerTimeline(customerId: string) {
  return useQuery({
    queryKey: customerTimelineQueryKey(customerId),
    queryFn: () => getCustomerTimeline(customerId),
    enabled: !!customerId,
  })
}

/** Customer Activity feed across all customers (docs/NAVIGATION.md §8.6). */
export function useCustomerActivity(type: CustomerTimelineEventFilter, limit: number) {
  return useQuery({
    queryKey: ['customers', 'activity', type, limit],
    queryFn: () => listCustomerActivity({ type, limit }),
    placeholderData: keepPreviousData,
  })
}
