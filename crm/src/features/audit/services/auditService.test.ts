import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Pure mock-service tests. vi.resetModules() gives every test fresh
 * stores, so audit entries from one test never leak into another.
 */
describe('auditService', () => {
  let audit: typeof import('./auditService')

  beforeEach(async () => {
    vi.resetModules()
    audit = await import('./auditService')
  })

  const all = () => audit.listAuditEntries({ search: '', category: 'all' })

  test('records entries newest first, attributed to the demo user', async () => {
    const entry = audit.recordAudit({
      category: 'settings',
      action: 'Did a thing',
      target: { type: 'x', id: 'x1', label: 'X' },
      changes: [],
    })
    const [first] = await all()
    expect(first.id).toBe(entry.id)
    expect(first.actor.name).toBe('Arjun Nair')
  })

  test('stored entries are frozen and cannot be changed', async () => {
    audit.recordAudit({
      category: 'settings',
      action: 'Original',
      target: { type: 'x', id: 'x1', label: 'X' },
      changes: [{ field: 'F', from: 'a', to: 'b' }],
    })
    const [first] = await all()
    expect(Object.isFrozen(first)).toBe(true)
    expect(() => {
      ;(first as { action: string }).action = 'Tampered'
    }).toThrow()
    expect(() => first.changes.push({ field: 'G', from: '', to: '' })).toThrow()
  })

  test('the service offers no way to edit or delete entries', () => {
    const exported = Object.keys(audit)
    expect(exported.some((name) => /delete|remove|update|edit|clear/i.test(name))).toBe(false)
  })

  test('repeat views within a few minutes are logged once', async () => {
    const view = {
      category: 'customer_data' as const,
      action: 'Viewed customer profile',
      target: { type: 'customer', id: 'cust-009', label: 'Someone' },
      changes: [],
    }
    audit.recordView(view)
    audit.recordView(view)
    const views = (await all()).filter((e) => e.target.id === 'cust-009')
    expect(views).toHaveLength(1)
  })

  test('diffFields lists only changed fields', () => {
    const changes = audit.diffFields(
      { a: 'x', b: 1, c: null },
      { a: 'x', b: 2, c: 'set' },
      { a: 'A', b: 'B', c: 'C' },
    )
    expect(changes).toEqual([
      { field: 'B', from: '1', to: '2' },
      { field: 'C', from: '—', to: 'set' },
    ])
  })

  test('filters by category and search', async () => {
    const customerData = await audit.listAuditEntries({ search: '', category: 'customer_data' })
    expect(customerData.every((e) => e.category === 'customer_data')).toBe(true)
    const byName = await audit.listAuditEntries({ search: 'divya', category: 'all' })
    expect(byName.length).toBeGreaterThan(0)
  })
})

describe('features write to the audit log', () => {
  beforeEach(() => vi.resetModules())

  test('settings: role change is logged with before/after; the last Owner is protected', async () => {
    const settings = await import('@/features/settings/services/settingsService')
    const audit = await import('./auditService')

    await settings.updateSettingsUserRole('user-003', 'manager')
    const [latest] = await audit.listAuditEntries({ search: '', category: 'user_access' })
    expect(latest).toMatchObject({ action: 'Changed user role', target: { label: 'Rahul Das' } })
    expect(latest.changes).toEqual([{ field: 'Role', from: 'Staff', to: 'Manager' }])

    await expect(settings.updateSettingsUserRole('user-001', 'manager')).rejects.toThrow('at least one Owner')
    await expect(settings.removeSettingsUser('user-001')).rejects.toThrow('at least one Owner')
  })

  test('settings: saving unchanged general settings logs nothing', async () => {
    const settings = await import('@/features/settings/services/settingsService')
    const audit = await import('./auditService')
    const before = (await audit.listAuditEntries({ search: '', category: 'settings' })).length

    const current = await settings.getGeneralSettings()
    await settings.updateGeneralSettings({ ...current })
    expect((await audit.listAuditEntries({ search: '', category: 'settings' })).length).toBe(before)

    await settings.updateGeneralSettings({ ...current, businessName: 'Broastin Kochi' })
    const [latest] = await audit.listAuditEntries({ search: '', category: 'settings' })
    expect(latest.changes).toEqual([{ field: 'Business name', from: 'Broastin', to: 'Broastin Kochi' }])
  })

  test('marketing: segment, coupon and campaign changes are logged', async () => {
    const segments = await import('@/features/segments/services/segmentService')
    const coupons = await import('@/features/coupons/services/couponService')
    const campaigns = await import('@/features/campaigns/services/campaignService')
    const audit = await import('./auditService')

    await segments.createSegment({
      name: 'Regulars',
      description: '',
      match: 'all',
      rules: [{ field: 'order_count', operator: 'gte', value: '3' }],
    })
    await coupons.setCouponDisabled('cpn-001', true)
    await campaigns.sendCampaign('camp-002')

    const actions = (await audit.listAuditEntries({ search: '', category: 'marketing' })).map((e) => e.action)
    expect(actions).toEqual(expect.arrayContaining(['Created segment', 'Disabled coupon', 'Sent campaign']))
  })

  test('customer data: opening a profile is logged; plain lookups are not', async () => {
    const customers = await import('@/features/customers/services/customerService')
    const audit = await import('./auditService')
    const count = async () =>
      (await audit.listAuditEntries({ search: '', category: 'customer_data' })).filter((e) => e.target.id === 'cust-010')
        .length

    await customers.getCustomerById('cust-010')
    expect(await count()).toBe(0)
    await customers.openCustomerProfile('cust-010')
    expect(await count()).toBe(1)
  })
})
