import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveCustomer,
  getMergePreview,
  importCustomers,
  listDuplicateGroups,
  mergeCustomers,
  previewCustomerImport,
  restoreCustomer,
} from '@/features/customers/services/customerService'
import type { MergeChoices } from '@/features/customers/utils/customerMerge'

/**
 * Archive/merge/import change who's in segments and campaign audiences,
 * so those caches are refreshed too.
 */
function useInvalidateCustomerData() {
  const queryClient = useQueryClient()
  return () => {
    for (const key of ['customers', 'segments', 'campaigns']) {
      queryClient.invalidateQueries({ queryKey: [key] })
    }
  }
}

export function useDuplicateGroups() {
  return useQuery({ queryKey: ['customers', 'duplicates'], queryFn: () => listDuplicateGroups() })
}

export function useMergePreview(primaryId: string, secondaryId: string) {
  return useQuery({
    queryKey: ['customers', 'merge-preview', primaryId, secondaryId],
    queryFn: () => getMergePreview(primaryId, secondaryId),
    enabled: !!primaryId && !!secondaryId,
    retry: false,
  })
}

export function useMergeCustomers() {
  const invalidate = useInvalidateCustomerData()
  return useMutation({
    mutationFn: ({ primaryId, secondaryId, choices }: { primaryId: string; secondaryId: string; choices: MergeChoices }) =>
      mergeCustomers(primaryId, secondaryId, choices),
    onSuccess: invalidate,
  })
}

export function useArchiveCustomer() {
  const invalidate = useInvalidateCustomerData()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => archiveCustomer(id, reason),
    onSuccess: invalidate,
  })
}

export function useRestoreCustomer() {
  const invalidate = useInvalidateCustomerData()
  return useMutation({ mutationFn: restoreCustomer, onSuccess: invalidate })
}

export function useImportPreview() {
  return useMutation({ mutationFn: previewCustomerImport })
}

export function useImportCustomers() {
  const invalidate = useInvalidateCustomerData()
  return useMutation({ mutationFn: importCustomers, onSuccess: invalidate })
}
