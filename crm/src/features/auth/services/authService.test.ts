import { beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * Demo sign-in and role checks (Book 3 §14 matrix). The test setup signs
 * in as the seed Owner; these tests sign out or switch user as needed.
 * Seed users: user-001 Owner, user-002 Manager, user-003 Staff,
 * user-004 Marketing Operator — all with the demo password.
 */
const PASSWORD = 'broastin-demo'

describe('authService', () => {
  let auth: typeof import('./authService')

  beforeEach(async () => {
    vi.resetModules()
    auth = await import('./authService')
    auth.signOut()
  })

  test('signs in by email (any case) with the demo password, and signs out', async () => {
    expect(auth.getCurrentUser()).toBeNull()
    const user = await auth.signIn('  RAHUL@broastin.example ', PASSWORD)
    expect(user).toMatchObject({ id: 'user-003', role: 'staff' })
    expect(auth.getCurrentUser()?.id).toBe('user-003')

    auth.signOut()
    expect(auth.getCurrentUser()).toBeNull()
  })

  test('wrong password and unknown email get the same message', async () => {
    await expect(auth.signIn('rahul@broastin.example', 'nope')).rejects.toThrow('Email or password is incorrect.')
    await expect(auth.signIn('nobody@broastin.example', PASSWORD)).rejects.toThrow('Email or password is incorrect.')
    expect(auth.getCurrentUser()).toBeNull()
  })

  test('changes are refused when signed out or when the role only has view access', async () => {
    const segments = await import('@/features/segments/services/segmentService')
    const campaigns = await import('@/features/campaigns/services/campaignService')
    const input = { name: 'Test', description: '', match: 'all' as const, rules: [] }

    await expect(segments.createSegment(input)).rejects.toThrow('sign in')

    await auth.signIn('divya@broastin.example', PASSWORD) // Manager: segments view, campaigns view
    await expect(segments.createSegment(input)).rejects.toThrow("Your role (Manager) can't make changes in Segments.")
    await expect(
      campaigns.createCampaign({ name: 'X', message: 'Hi', segmentId: 'seg-vip', scheduledAt: null, repeatYearly: false }),
    ).rejects.toThrow("Your role (Manager) can't make changes in Campaigns")

    await auth.signIn('meera@broastin.example', PASSWORD) // Marketing Operator: segments manage
    expect(() => auth.requirePermission('segments')).not.toThrow()
    expect(() => auth.requirePermission('settings', 'view')).toThrow("can't open Settings")
  }, 20_000)

  test('a role change takes effect at once, and a removed user is signed out', async () => {
    const settings = await import('@/features/settings/services/settingsService')
    await auth.signIn('arjun@broastin.example', PASSWORD)
    await settings.updateSettingsUserRole('user-003', 'manager')

    await auth.signIn('rahul@broastin.example', PASSWORD)
    expect(auth.getCurrentUser()?.role).toBe('manager')

    await auth.signIn('arjun@broastin.example', PASSWORD)
    await settings.removeSettingsUser('user-003')
    // Rahul's stored session no longer resolves to a user.
    const store = await import('./sessionStore')
    store.setSession({ userId: 'user-003', name: 'Rahul Das', roleLabel: 'Manager' })
    expect(auth.getCurrentUser()).toBeNull()
  }, 20_000)

  test('users can be added only with a new email, and you cannot remove yourself', async () => {
    const settings = await import('@/features/settings/services/settingsService')
    await auth.signIn('arjun@broastin.example', PASSWORD)
    await expect(
      settings.addSettingsUser({ name: 'Copy', email: 'Divya@Broastin.example', role: 'staff' }),
    ).rejects.toThrow('already exists')
    await expect(settings.removeSettingsUser('user-001')).rejects.toThrow('your own account')

    const added = await settings.addSettingsUser({ name: 'New Person', email: 'new@broastin.example', role: 'staff' })
    expect((await auth.signIn('new@broastin.example', PASSWORD)).id).toBe(added.id)
  }, 20_000)

  test('audit entries name the signed-in person', async () => {
    const settings = await import('@/features/settings/services/settingsService')
    const audit = await import('@/features/audit/services/auditService')
    await auth.signIn('arjun@broastin.example', PASSWORD)
    await settings.updateSettingsUserRole('user-004', 'staff')
    const [latest] = await audit.listAuditEntries({ search: '', category: 'user_access' })
    expect(latest.actor).toEqual({ id: 'user-001', name: 'Arjun Nair', roleLabel: 'Owner' })
  }, 20_000)
})

describe('access rules', () => {
  test('paths map to matrix areas', async () => {
    const { areaForPath } = await import('@/features/auth/utils/access')
    expect(areaForPath('/customers/segments/seg-vip')).toBe('segments')
    expect(areaForPath('/customers/cust-001')).toBe('customers')
    expect(areaForPath('/settings/audit')).toBe('audit_log')
    expect(areaForPath('/settings/users')).toBe('settings')
    expect(areaForPath('/campaigns/coupons/new')).toBe('campaigns')
    expect(areaForPath('/no-such-page')).toBeNull()
  })

  test('view-only roles cannot open editor pages; managers can', async () => {
    const { accessFor } = await import('@/features/auth/utils/access')
    // Manager: segments and campaigns are view only.
    expect(accessFor('manager', '/customers/segments')).toBe('view')
    expect(accessFor('manager', '/customers/segments/new')).toBe('none')
    expect(accessFor('manager', '/customers/segments/seg-vip/edit')).toBe('none')
    expect(accessFor('manager', '/campaigns/templates/tpl-001')).toBe('none')
    expect(accessFor('manager', '/campaigns/templates')).toBe('view')
    // Staff: customers view only, so no import or merge.
    expect(accessFor('staff', '/customers/import')).toBe('none')
    expect(accessFor('owner', '/customers/import')).toBe('manage')
    expect(accessFor('marketing_operator', '/campaigns/new')).toBe('manage')
  })

  test('the menu hides what a role cannot open', async () => {
    const { visibleModules } = await import('@/features/auth/utils/access')
    const staff = visibleModules('staff')
    const ids = staff.map((m) => m.id)
    expect(ids).not.toContain('campaigns')
    expect(ids).not.toContain('settings')
    expect(ids).toContain('loyalty')
    const customers = staff.find((m) => m.id === 'customers')
    expect(customers?.submenu?.some((s) => s.path === '/customers/segments')).toBe(false)

    const owner = visibleModules('owner')
    expect(owner.find((m) => m.id === 'settings')?.submenu?.some((s) => s.path === '/settings/audit')).toBe(true)
    expect(visibleModules('manager').some((m) => m.id === 'settings')).toBe(false)
  })
})
