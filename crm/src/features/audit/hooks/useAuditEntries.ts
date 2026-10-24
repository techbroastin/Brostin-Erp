import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listAuditEntries } from '@/features/audit/services/auditService'
import type { AuditListParams } from '@/features/audit/types/audit'

/**
 * Always refetched on open: entries are written as side effects of other
 * features' changes, which don't invalidate this query themselves.
 */
export function useAuditEntries(params: AuditListParams) {
  return useQuery({
    queryKey: ['audit', 'list', params],
    queryFn: () => listAuditEntries(params),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  })
}
