import { beforeEach, describe, expect, test, vi } from 'vitest'
import { combineCustomers, findDuplicateGroups, mergeConflicts, phoneKey } from '@/features/customers/utils/customerMerge'
import { parseCsv, previewImport } from '@/features/customers/utils/customerImport'
import { normalCustomers } from '@/features/customers/mock/customers.mock'

const ALL = { search: '', page: 1, pageSize: 1000, sortBy: 'name' } as const

describe('merge helpers', () => {
  test('phoneKey ignores formatting and country code', () => {
    expect(phoneKey('+91 97000 01370')).toBe('9700001370')
    expect(phoneKey('+91-97000-01370')).toBe('9700001370')
    expect(phoneKey('9700001370')).toBe('9700001370')
  })

  test('the seeded duplicates are found by phone', () => {
    const groups = findDuplicateGroups(normalCustomers)
    expect(groups.map((g) => g.map((c) => c.id).sort())).toEqual(
      expect.arrayContaining([
        ['cust-011', 'cust-026'],
        ['cust-003', 'cust-027'],
      ]),
    )
  })

  test('conflicts cover disagreeing details but not blanks', () => {
    const lakshmi = normalCustomers.find((c) => c.id === 'cust-011')!
    const dup = normalCustomers.find((c) => c.id === 'cust-026')!
    const fields = mergeConflicts(lakshmi, dup).map((c) => c.field)
    expect(fields).toContain('name')
    expect(fields).not.toContain('phone') // same number, different format
    expect(() => combineCustomers(lakshmi, dup, {})).toThrow('Choose which value')
  })

  test('combining adds up history and uses the chosen values', () => {
    const lakshmi = normalCustomers.find((c) => c.id === 'cust-011')!
    const dup = normalCustomers.find((c) => c.id === 'cust-026')!
    const choices = Object.fromEntries(mergeConflicts(lakshmi, dup).map((c) => [c.field, 'secondary' as const]))
    const merged = combineCustomers(lakshmi, dup, choices)
    expect(merged.id).toBe(lakshmi.id)
    expect(merged.name).toBe('Lakshmi P')
    expect(merged.orderCount).toBe(lakshmi.orderCount + dup.orderCount)
    expect(merged.lifetimeSpend).toBe(lakshmi.lifetimeSpend + dup.lifetimeSpend)
    expect(merged.preferenceTags).toEqual(expect.arrayContaining(dup.preferenceTags))
  })
})

describe('import helpers', () => {
  test('parseCsv handles quotes, escaped quotes and CRLF', () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
    ])
  })

  test('previewImport classifies rows and never overwrites', () => {
    const lakshmi = normalCustomers.find((c) => c.id === 'cust-001')!
    const csv = [
      'Phone,Name,date_of_birth,whatsapp_opt_in,tags',
      '+91 98470 11111,New Person,1990-01-31,yes,Spicy',
      `${lakshmi.phone},${lakshmi.name},,${lakshmi.whatsappOptIn ? 'no' : 'yes'},Mild`,
      '98470 11111,Same Phone Again,,,',
      '12345,Bad Phone,1990-02-30,maybe,',
      ',,,,',
    ].join('\n')
    const { rows, missingColumns } = previewImport(csv, normalCustomers)
    expect(missingColumns).toEqual([])
    expect(rows.map((r) => r.status)).toEqual(['new', 'update', 'duplicate_in_file', 'invalid'])
    expect(rows[1].conflicts).toEqual(['WhatsApp opt-in'])
    expect(rows[3].errors).toHaveLength(3)
  })

  test('missing required columns are reported', () => {
    expect(previewImport('name,tags\nA,b', []).missingColumns).toEqual(['phone'])
  })
})

describe('customerService CRM tools', () => {
  let service: typeof import('./customerService')

  beforeEach(async () => {
    vi.resetModules()
    service = await import('./customerService')
  })

  test('archived customers leave lists and segments but can be restored', async () => {
    const segments = await import('@/features/segments/services/segmentService')
    const before = (await segments.previewSegment({ match: 'all', rules: [{ field: 'order_count', operator: 'gte', value: '0' }] })).totalCustomers

    await service.archiveCustomer('cust-005', 'Moved away')
    const { items } = await service.listCustomers(ALL)
    expect(items.some((c) => c.id === 'cust-005')).toBe(false)
    expect((await service.listCustomers({ ...ALL, includeArchived: true })).items.some((c) => c.id === 'cust-005')).toBe(true)
    expect((await segments.previewSegment({ match: 'all', rules: [{ field: 'order_count', operator: 'gte', value: '0' }] })).totalCustomers).toBe(before - 1)

    await service.restoreCustomer('cust-005')
    expect((await service.getCustomerById('cust-005'))?.archivedAt).toBeNull()
  })

  test('merging archives the second record, links it, and blocks restoring it', async () => {
    const preview = await service.getMergePreview('cust-003', 'cust-027')
    const choices = Object.fromEntries(preview.conflicts.map((c) => [c.field, 'primary' as const]))
    const merged = await service.mergeCustomers('cust-003', 'cust-027', choices)
    const dup = await service.getCustomerById('cust-027')

    expect(merged.orderCount).toBe(preview.primary.orderCount + preview.secondary.orderCount)
    expect(dup).toMatchObject({ mergedIntoId: 'cust-003' })
    expect(dup?.archivedAt).not.toBeNull()
    await expect(service.restoreCustomer('cust-027')).rejects.toThrow('merged')
    expect(await service.listDuplicateGroups()).toHaveLength(1)
  })

  test('merging requires a choice for every conflict', async () => {
    await expect(service.mergeCustomers('cust-011', 'cust-026', {})).rejects.toThrow('Choose which value')
  })

  test('import creates new customers, fills blanks, and flags conflicts instead of overwriting', async () => {
    const target = (await service.getCustomerById('cust-015'))!
    const csv = [
      'name,phone,date_of_birth,whatsapp_opt_in,tags',
      'Brand New,+91 98470 22222,,yes,',
      `${target.name},${target.phone},1980-01-01,${target.whatsappOptIn ? 'no' : 'yes'},VIP`,
    ].join('\n')
    const result = await service.importCustomers(csv)
    expect(result).toMatchObject({ created: 1, updated: 1, flagged: 1 })

    const updated = (await service.getCustomerById('cust-015'))!
    expect(updated.whatsappOptIn).toBe(target.whatsappOptIn) // conflict kept as is
    expect(updated.preferenceTags).toContain('VIP')
    expect(updated.dateOfBirth).toBe(target.dateOfBirth ?? '1980-01-01')
    expect(updated.alert).toMatch(/review/)
    const { items } = await service.listCustomers({ ...ALL, search: 'Brand New' })
    expect(items).toHaveLength(1)
  })
})
