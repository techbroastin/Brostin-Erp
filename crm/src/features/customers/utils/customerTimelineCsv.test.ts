import { describe, expect, test } from 'vitest'
import { timelineEventsToCsv } from './customerTimelineCsv'
import type { CustomerTimelineEvent } from '@/features/customers/types/customerTimeline'

const sample: CustomerTimelineEvent[] = [
  {
    id: 'tl-1',
    customerId: 'cust-001',
    type: 'visit',
    title: 'Order BR-1040',
    detail: 'takeaway · ₹199 · placed',
    occurredAt: '2026-10-19T10:00:00.000Z',
    href: '/orders/ord-001',
    correctsEventId: null,
  },
  {
    id: 'tl-2',
    customerId: 'cust-001',
    type: 'note',
    title: 'Correction, with a "quote"',
    detail: 'Supersedes tl-1-adjacent note',
    occurredAt: '2026-10-19T11:00:00.000Z',
    href: null,
    correctsEventId: 'tl-0',
  },
]

describe('timelineEventsToCsv', () => {
  test('produces a header row plus one row per event', () => {
    const csv = timelineEventsToCsv(sample)
    const lines = csv.split('\n')

    expect(lines[0]).toBe('Date,Type,Title,Detail,Corrects Event Id')
    expect(lines).toHaveLength(3)
  })

  test('escapes embedded double quotes per CSV convention', () => {
    const csv = timelineEventsToCsv(sample)
    expect(csv).toContain('"Correction, with a ""quote"""')
  })

  test('includes the correctsEventId column value when set, empty when not', () => {
    const csv = timelineEventsToCsv(sample)
    const lines = csv.split('\n')

    expect(lines[1].endsWith('""')).toBe(true)
    expect(lines[2].endsWith('"tl-0"')).toBe(true)
  })

  test('produces only the header row for an empty event list', () => {
    expect(timelineEventsToCsv([])).toBe('Date,Type,Title,Detail,Corrects Event Id')
  })
})
