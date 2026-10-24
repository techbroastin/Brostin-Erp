import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests — no backend. vi.resetModules() gives every
 * test fresh customer, reward and audit stores.
 */
const ALL_CUSTOMERS = { search: '', page: 1, pageSize: 1000, sortBy: 'name' as const }
const ALL_ACTIVITY = { search: '', page: 1, pageSize: 1000 }

describe('loyaltyService', () => {
  let loyalty: typeof import('./loyaltyService')
  let customers: typeof import('@/features/customers/services/customerService')

  beforeEach(async () => {
    vi.resetModules()
    loyalty = await import('./loyaltyService')
    customers = await import('@/features/customers/services/customerService')
  })

  async function expectLedgerMatchesBalances() {
    const { items: balances } = await loyalty.listCustomerBalances({ ...ALL_CUSTOMERS, sortBy: 'name' })
    const { items: events } = await loyalty.listLoyaltyActivity(ALL_ACTIVITY)
    const sums = new Map<string, number>()
    for (const e of events) sums.set(e.customerId, (sums.get(e.customerId) ?? 0) + e.points)

    for (const b of balances) expect(sums.get(b.id) ?? 0, b.name).toBe(b.points ?? 0)
    // Every event belongs to a customer listed in Customer Balances.
    const listed = new Set(balances.map((b) => b.id))
    expect(events.every((e) => listed.has(e.customerId))).toBe(true)
  }

  test("each customer's activity adds up to their balance", async () => {
    const { items } = await loyalty.listLoyaltyActivity(ALL_ACTIVITY)
    expect(items.length).toBeGreaterThan(0)
    await expectLedgerMatchesBalances()
  })

  test('balances and activity still agree after a merge and an archive', async () => {
    const preview = await customers.getMergePreview('cust-004', 'cust-007')
    const choices = Object.fromEntries(preview.conflicts.map((c) => [c.field, 'primary' as const]))
    await customers.mergeCustomers('cust-004', 'cust-007', choices)
    await customers.archiveCustomer('cust-010', '')

    const { items } = await loyalty.listLoyaltyActivity(ALL_ACTIVITY)
    expect(items.some((e) => e.customerId === 'cust-007' || e.customerId === 'cust-010')).toBe(false)
    await expectLedgerMatchesBalances()

    // The archived customer's own history is still available on request.
    const withArchived = await loyalty.listLoyaltyActivity({ ...ALL_ACTIVITY, includeArchived: true })
    expect(withArchived.items.some((e) => e.customerId === 'cust-010')).toBe(true)
  }, 20_000)

  test('overview counts come from balances, ledger and catalogue', async () => {
    const overview = await loyalty.getLoyaltyOverview()
    const { items: balances } = await loyalty.listCustomerBalances({ ...ALL_CUSTOMERS, sortBy: 'name' })
    const { items: events } = await loyalty.listLoyaltyActivity(ALL_ACTIVITY)
    const rewards = await loyalty.getRewards()

    expect(overview.totalPointsOutstanding).toBe(balances.reduce((sum, b) => sum + (b.points ?? 0), 0))
    expect(overview.customersWithPoints).toBe(balances.filter((b) => (b.points ?? 0) > 0).length)
    expect(overview.rewardsRedeemed).toBe(events.filter((e) => e.type === 'redeemed').length)
    expect(overview.rewardsAvailable).toBe(rewards.length)
  })

  test('activity filters by program', async () => {
    const { items } = await loyalty.listLoyaltyActivity({ ...ALL_ACTIVITY, programId: 'prog-001' })
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((e) => e.programId === 'prog-001' && e.type === 'earned')).toBe(true)
  })

  test('saveReward adds and edits rewards, and writes the audit log', async () => {
    const audit = await import('@/features/audit/services/auditService')
    const before = await loyalty.getRewards()

    const added = await loyalty.saveReward(undefined, { name: '  Free Dessert ', description: 'Any dessert.', pointCost: 250 })
    expect(added.name).toBe('Free Dessert')
    expect(await loyalty.getRewards()).toHaveLength(before.length + 1)
    expect((await loyalty.getLoyaltyOverview()).rewardsAvailable).toBe(before.length + 1)

    const edited = await loyalty.saveReward(added.id, { name: 'Free Dessert', description: 'Any dessert.', pointCost: 300 })
    expect(edited).toMatchObject({ id: added.id, pointCost: 300 })
    expect((await loyalty.getRewards()).filter((r) => r.id === added.id)).toHaveLength(1)

    const log = await audit.listAuditEntries({ search: '', category: 'marketing' })
    expect(log.map((e) => e.action)).toEqual(expect.arrayContaining(['Created reward', 'Edited reward']))
  }, 20_000)

  test('saveReward rejects duplicate names, bad point costs and unknown ids', async () => {
    const [first] = await loyalty.getRewards()
    await expect(
      loyalty.saveReward(undefined, { name: first.name.toUpperCase(), description: '', pointCost: 10 }),
    ).rejects.toThrow('already exists')
    await expect(loyalty.saveReward(undefined, { name: 'Half point', description: '', pointCost: 1.5 })).rejects.toThrow(
      'whole number',
    )
    await expect(loyalty.saveReward('rwd-missing', { name: 'Ghost', description: '', pointCost: 10 })).rejects.toThrow(
      'Unknown reward',
    )
  }, 20_000)

  test('empty and error scenarios', async () => {
    expect(await loyalty.getRewards('empty')).toEqual([])
    expect((await loyalty.listLoyaltyActivity(ALL_ACTIVITY, 'empty')).total).toBe(0)
    await expect(loyalty.getLoyaltyOverview('error')).rejects.toThrow()
    await expect(loyalty.listCustomerBalances({ ...ALL_CUSTOMERS, sortBy: 'name' }, 'error')).rejects.toThrow()
  })
})

describe('program performance', () => {
  beforeEach(() => vi.resetModules())

  test('matches the ledger for the program and is zero for an unused one', async () => {
    const programs = await import('@/features/programs/services/programService')
    const loyalty = await import('./loyaltyService')

    const { items } = await loyalty.listLoyaltyActivity({ ...ALL_ACTIVITY, programId: 'prog-001' })
    const perf = await programs.getProgramPerformance('prog-001')
    expect(perf).toEqual({
      timesApplied: items.length,
      customersRewarded: new Set(items.map((e) => e.customerId)).size,
      pointsAwarded: items.reduce((sum, e) => sum + e.points, 0),
      lastAppliedAt: items[0].createdAt,
    })

    expect(await programs.getProgramPerformance('prog-004')).toEqual({
      timesApplied: 0,
      customersRewarded: 0,
      pointsAwarded: 0,
      lastAppliedAt: null,
    })
  }, 20_000)
})
