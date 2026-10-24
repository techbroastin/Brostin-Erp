import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  listSegments,
  getSegmentDetail,
  previewSegment,
  getSegmentFieldOptions,
  createSegment,
  updateSegment,
  deleteSegment,
} from '@/features/segments/services/segmentService'
import type { SegmentDefinition, SegmentInput } from '@/features/segments/types/segment'

/** Central Segments query keys, per docs/FRONTEND_ARCHITECTURE.md §17. */
export const segmentListQueryKey = ['segments', 'list'] as const
export const segmentDetailQueryKey = (id: string) => ['segments', 'detail', id] as const

export function useSegments() {
  return useQuery({ queryKey: segmentListQueryKey, queryFn: () => listSegments() })
}

export function useSegmentDetail(id: string) {
  return useQuery({ queryKey: segmentDetailQueryKey(id), queryFn: () => getSegmentDetail(id) })
}

/** Re-runs as the builder's definition changes; keeps the last result visible meanwhile. */
export function useSegmentPreview(definition: SegmentDefinition, enabled: boolean) {
  return useQuery({
    queryKey: ['segments', 'preview', definition],
    queryFn: () => previewSegment(definition),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useSegmentFieldOptions() {
  return useQuery({ queryKey: ['segments', 'field-options'], queryFn: () => getSegmentFieldOptions() })
}

/** Create when `id` is undefined, otherwise update that custom segment. */
export function useSaveSegment(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SegmentInput) => (id ? updateSegment(id, input) : createSegment(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })
}

export function useDeleteSegment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSegment,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: segmentDetailQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: segmentListQueryKey })
    },
  })
}
