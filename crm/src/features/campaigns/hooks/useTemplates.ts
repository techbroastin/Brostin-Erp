import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from '@/features/campaigns/services/templateService'
import type { TemplateInput, TemplateListParams } from '@/features/campaigns/types/template'

export function useTemplates(params: TemplateListParams) {
  return useQuery({ queryKey: ['templates', 'list', params], queryFn: () => listTemplates(params) })
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['templates', 'detail', id],
    queryFn: () => getTemplate(id as string),
    enabled: id !== null,
  })
}

/** Create when `id` is undefined, otherwise update that template. */
export function useSaveTemplate(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TemplateInput) => (id ? updateTemplate(id, input) : createTemplate(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
