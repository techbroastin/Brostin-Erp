import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProgram,
  getProgram,
  getProgramPerformance,
  getProgramProblems,
  listPrograms,
  setProgramStatus,
  simulateVisit,
  updateProgram,
} from '@/features/programs/services/programService'
import type { ProgramInput, ProgramStatus } from '@/features/programs/types/program'

export function usePrograms(status: ProgramStatus | 'all' = 'all') {
  return useQuery({ queryKey: ['programs', 'list', status], queryFn: () => listPrograms(status) })
}

export function useProgram(id: string) {
  return useQuery({ queryKey: ['programs', 'detail', id], queryFn: () => getProgram(id) })
}

export function useProgramPerformance(id: string) {
  return useQuery({ queryKey: ['programs', 'performance', id], queryFn: () => getProgramPerformance(id) })
}

export function useProgramProblems(id: string) {
  return useQuery({ queryKey: ['programs', 'problems', id], queryFn: () => getProgramProblems(id) })
}

/** Create when `id` is undefined, otherwise update. "Can't combine" changes touch other programs, so all program queries refresh. */
export function useSaveProgram(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProgramInput) => (id ? updateProgram(id, input) : createProgram(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useSetProgramStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: ProgramStatus) => setProgramStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useSimulateVisit() {
  return useMutation({ mutationFn: simulateVisit })
}
