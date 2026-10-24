import type { CustomerTimelineEvent } from '@/features/customers/types/customerTimeline'

export function timelineEventsToCsv(events: CustomerTimelineEvent[]): string {
  const header = ['Date', 'Type', 'Title', 'Detail', 'Corrects Event Id']
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const rows = events.map((e) =>
    [new Date(e.occurredAt).toISOString(), e.type, e.title, e.detail, e.correctsEventId ?? '']
      .map(escape)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}
