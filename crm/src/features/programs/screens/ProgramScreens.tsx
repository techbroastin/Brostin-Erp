import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsDesktopViewport } from '@/hooks/use-viewport'
import { useProgram } from '@/features/programs/hooks/usePrograms'
import { ProgramListContent } from '@/features/programs/components/ProgramListContent'
import { ProgramDetailContent } from '@/features/programs/components/ProgramDetailContent'
import { ProgramBuilderContent } from '@/features/programs/components/desktop/ProgramBuilderContent'
import { ProgramDesktopOnlyNotice } from '@/features/programs/components/shared/ProgramParts'

/** /loyalty/programs — phone: read-only list; desktop: list, New program, Try a visit. */
export function ProgramsScreen() {
  return <ProgramListContent isDesktop={useIsDesktopViewport()} />
}

function useProgramFromRoute() {
  const { programId } = useParams<{ programId: string }>()
  return useProgram(programId ?? '')
}

function NotFound() {
  return <p className="p-4 py-16 text-center text-body font-medium">Program not found.</p>
}

/** /loyalty/programs/:programId — phone: read-only; desktop: lifecycle actions. */
export function ProgramDetailScreen() {
  const isDesktop = useIsDesktopViewport()
  const { data, isPending, isError, refetch } = useProgramFromRoute()
  if (isError) {
    return (
      <button type="button" onClick={() => refetch()} className="p-4 py-16 text-center text-body font-medium underline">
        Couldn't load this program — retry
      </button>
    )
  }
  if (isPending) return <Skeleton className="m-4 h-64" />
  if (!data) return <NotFound />
  return <ProgramDetailContent program={data} isDesktop={isDesktop} />
}

/** /loyalty/programs/new — Desktop Admin only. */
export function CreateProgramScreen() {
  return useIsDesktopViewport() ? <ProgramBuilderContent /> : <ProgramDesktopOnlyNotice />
}

/** /loyalty/programs/:programId/edit — draft or paused only. Desktop Admin only. */
export function EditProgramScreen() {
  const isDesktop = useIsDesktopViewport()
  const { data, isPending } = useProgramFromRoute()
  if (!isDesktop) return <ProgramDesktopOnlyNotice />
  if (isPending) return <Skeleton className="h-64 w-full" />
  if (!data) return <NotFound />
  if (data.status === 'active' || data.status === 'archived') {
    return (
      <p className="py-16 text-center text-body font-medium">
        {data.status === 'active' ? 'Pause this program before editing it.' : 'Archived programs can’t be edited.'}
      </p>
    )
  }
  return <ProgramBuilderContent key={data.id} program={data} />
}
