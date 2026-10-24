import type { CampaignSummary } from '@/features/campaigns/types/campaign'

/** YYYY-MM-DD in local time. */
export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Monday-first weeks covering the whole month, padded with the days of
 * the neighbouring months so every row has 7 days.
 */
export function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  const weeks: Date[][] = []
  const cursor = new Date(start)
  do {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  } while (cursor.getMonth() === month)
  return weeks
}

/** The day a campaign belongs on: when it was sent, else when it's scheduled. Drafts have none. */
export function campaignDate(campaign: Pick<CampaignSummary, 'sentAt' | 'scheduledAt'>): Date | null {
  const at = campaign.sentAt ?? campaign.scheduledAt
  return at ? new Date(at) : null
}

export function groupByDay<T extends Pick<CampaignSummary, 'sentAt' | 'scheduledAt'>>(campaigns: T[]): Map<string, T[]> {
  const byDay = new Map<string, T[]>()
  for (const campaign of campaigns) {
    const date = campaignDate(campaign)
    if (!date) continue
    const key = dateKey(date)
    byDay.set(key, [...(byDay.get(key) ?? []), campaign])
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => campaignDate(a)!.getTime() - campaignDate(b)!.getTime())
  }
  return byDay
}
