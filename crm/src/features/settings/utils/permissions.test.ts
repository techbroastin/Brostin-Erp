import { describe, expect, test } from 'vitest'
import { PERMISSION_AREAS, ROLE_PERMISSIONS, can } from './permissions'
import { SETTINGS_USER_ROLES } from '@/features/settings/types/settings'

describe('permission matrix', () => {
  test('every role defines every area', () => {
    for (const role of SETTINGS_USER_ROLES) {
      expect(Object.keys(ROLE_PERMISSIONS[role]).sort()).toEqual([...PERMISSION_AREAS].sort())
    }
  })

  test('only the Owner can manage settings or see the audit log', () => {
    for (const role of SETTINGS_USER_ROLES) {
      expect(can(role, 'settings', 'manage')).toBe(role === 'owner')
      expect(can(role, 'audit_log', 'view')).toBe(role === 'owner')
    }
  })

  test('approved highlights of the matrix', () => {
    expect(can('staff', 'loyalty', 'manage')).toBe(true)
    expect(can('staff', 'customers', 'manage')).toBe(false)
    expect(can('marketing_operator', 'campaigns', 'manage')).toBe(true)
    expect(can('marketing_operator', 'orders', 'view')).toBe(false)
    expect(can('manager', 'campaigns', 'view')).toBe(true)
    expect(can('manager', 'campaigns', 'manage')).toBe(false)
  })
})
