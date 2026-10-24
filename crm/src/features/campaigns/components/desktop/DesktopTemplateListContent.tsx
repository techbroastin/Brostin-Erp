import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { CampaignErrorState } from '@/features/campaigns/components/shared/CampaignErrorState'
import { useTemplates } from '@/features/campaigns/hooks/useTemplates'
import { OCCASION_LABELS, TEMPLATE_OCCASIONS } from '@/features/campaigns/utils/personalize'
import type { TemplateOccasion } from '@/features/campaigns/types/template'
import { cn } from '@/lib/utils'

const COLUMN_COUNT = 5

/** Template Library — Book 3 §4, tagged by occasion and audience. Desktop Admin only. */
export function DesktopTemplateListContent() {
  const [occasion, setOccasion] = useState<TemplateOccasion | 'all'>('all')
  const { data, isPending, isError, refetch } = useTemplates({ occasion })
  const templates = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-page-title font-semibold">Templates</h1>
          <DemoDataBadge />
        </div>
        <Link to="/campaigns/templates/new" className={buttonVariants({ variant: 'default', size: 'sm' })}>
          <Plus className="size-4" />
          New template
        </Link>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filter by occasion">
        {(['all', ...TEMPLATE_OCCASIONS] as const).map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={occasion === o}
            onClick={() => setOccasion(o)}
            className={cn(buttonVariants({ variant: occasion === o ? 'default' : 'outline', size: 'sm' }))}
          >
            {o === 'all' ? 'All' : OCCASION_LABELS[o]}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <CampaignErrorState title="Couldn't load templates" message="Something went wrong. Please try again." onRetry={() => refetch()} />
          ) : !isPending && templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-body font-medium">
                {occasion === 'all' ? 'No templates yet.' : `No ${OCCASION_LABELS[occasion].toLowerCase()} templates yet.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Written for</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{OCCASION_LABELS[template.occasion]}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {template.segmentId === null
                            ? 'Any segment'
                            : (template.segmentName ?? <span className="text-destructive">Segment deleted</span>)}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-muted-foreground">{template.body}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Link
                            to={`/campaigns/templates/${template.id}`}
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            Edit
                          </Link>{' '}
                          <Link
                            to={`/campaigns/new?template=${template.id}`}
                            className={buttonVariants({ variant: 'default', size: 'sm' })}
                          >
                            Use
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
