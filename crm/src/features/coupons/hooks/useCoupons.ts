import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  listCoupons,
  getCouponDetail,
  listRedemptions,
  createCoupon,
  setCouponDisabled,
  type CouponListParams,
  type RedemptionListParams,
} from '@/features/coupons/services/couponService'

/** Central Coupons query keys, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const couponDetailQueryKey = (id: string) => ['coupons', 'detail', id] as const

export function useCoupons(params: CouponListParams) {
  return useQuery({
    queryKey: ['coupons', 'list', params],
    queryFn: () => listCoupons(params),
    placeholderData: keepPreviousData,
  })
}

export function useCouponDetail(id: string) {
  return useQuery({ queryKey: couponDetailQueryKey(id), queryFn: () => getCouponDetail(id) })
}

export function useRedemptions(params: RedemptionListParams) {
  return useQuery({
    queryKey: ['coupons', 'redemptions', params],
    queryFn: () => listRedemptions(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}

export function useSetCouponDisabled(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (disabled: boolean) => setCouponDisabled(id, disabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })
}
