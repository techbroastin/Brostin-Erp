import type { Customer } from '@/features/customers/types/customer'
import { phoneKey } from '@/features/customers/utils/customerMerge'

/**
 * Book 3 §1 Bulk Import. CSV columns (header row, any order, case
 * doesn't matter): name, phone (required), date_of_birth, anniversary
 * (YYYY-MM-DD), whatsapp_opt_in (yes/no), tags (separated by ;).
 */
export const IMPORT_COLUMNS = ['name', 'phone', 'date_of_birth', 'anniversary', 'whatsapp_opt_in', 'tags'] as const
export const REQUIRED_COLUMNS = ['name', 'phone'] as const
export const MAX_IMPORT_ROWS = 1000

export const IMPORT_TEMPLATE_CSV = [
  IMPORT_COLUMNS.join(','),
  'Asha Menon,+91 98470 12345,1992-06-14,,yes,Spicy;Family packs',
  'Rohan Das,9847012346,,2018-11-02,no,',
].join('\n')

/** Minimal RFC 4180 parsing: commas, quoted fields, "" escapes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

export type ImportedFields = {
  name: string
  phone: string
  dateOfBirth: string | null
  anniversaryDate: string | null
  whatsappOptIn: boolean | null
  tags: string[]
}

export type ImportRowStatus = 'new' | 'update' | 'no_change' | 'duplicate_in_file' | 'invalid'

export type ImportRow = {
  /** 1-based line number in the file (the header is line 1). */
  line: number
  fields: ImportedFields
  status: ImportRowStatus
  errors: string[]
  matchCustomerId: string | null
  matchCustomerName: string | null
  /** Empty fields on the existing customer that this row fills in. */
  fills: string[]
  /** Fields where the file disagrees with the existing customer — flagged, never overwritten. */
  conflicts: string[]
}

export type ImportPreview = {
  missingColumns: string[]
  tooManyRows: boolean
  rows: ImportRow[]
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

function validDate(value: string): boolean {
  if (!DATE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

function parseOptIn(value: string): boolean | null | 'invalid' {
  const v = value.trim().toLowerCase()
  if (v === '') return null
  if (['yes', 'y', 'true', '1'].includes(v)) return true
  if (['no', 'n', 'false', '0'].includes(v)) return false
  return 'invalid'
}

/**
 * Checks every row against the rules and the existing customers, without
 * changing anything. Matching is by phone (the merge key). For a match,
 * only blank fields are filled; differing values are listed as conflicts.
 */
export function previewImport(text: string, existing: Customer[]): ImportPreview {
  const [header = [], ...body] = parseCsv(text)
  const columns = header.map((h) => h.trim().toLowerCase())
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !columns.includes(c))
  if (missingColumns.length > 0) return { missingColumns, tooManyRows: false, rows: [] }
  if (body.length > MAX_IMPORT_ROWS) return { missingColumns: [], tooManyRows: true, rows: [] }

  const cell = (row: string[], name: string) => {
    const index = columns.indexOf(name)
    return index === -1 ? '' : (row[index] ?? '').trim()
  }
  const byPhone = new Map(existing.filter((c) => !c.archivedAt).map((c) => [phoneKey(c.phone), c]))
  const seenInFile = new Set<string>()

  const rows = body.map((raw, i): ImportRow => {
    const errors: string[] = []
    const name = cell(raw, 'name')
    const phone = cell(raw, 'phone')
    const dob = cell(raw, 'date_of_birth')
    const anniversary = cell(raw, 'anniversary')
    const optIn = parseOptIn(cell(raw, 'whatsapp_opt_in'))
    const tags = cell(raw, 'tags')
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean)

    if (!name) errors.push('Name is missing.')
    if (name.length > 120) errors.push('Name is too long.')
    const key = phoneKey(phone)
    if (key.length !== 10 || !/^[6-9]/.test(key)) errors.push('Phone must be a 10-digit Indian mobile number.')
    if (dob && !validDate(dob)) errors.push('Date of birth must be YYYY-MM-DD.')
    if (anniversary && !validDate(anniversary)) errors.push('Anniversary must be YYYY-MM-DD.')
    if (optIn === 'invalid') errors.push('WhatsApp opt-in must be yes or no.')

    const fields: ImportedFields = {
      name,
      phone,
      dateOfBirth: dob || null,
      anniversaryDate: anniversary || null,
      whatsappOptIn: optIn === 'invalid' ? null : optIn,
      tags,
    }
    const base = { line: i + 2, fields, errors, matchCustomerId: null, matchCustomerName: null, fills: [], conflicts: [] }

    if (errors.length > 0) return { ...base, status: 'invalid' }
    if (seenInFile.has(key)) {
      return { ...base, status: 'duplicate_in_file', errors: ['Same phone as an earlier row in this file.'] }
    }
    seenInFile.add(key)

    const match = byPhone.get(key)
    if (!match) return { ...base, status: 'new' }

    const fills: string[] = []
    const conflicts: string[] = []
    const compare = (label: string, current: string | boolean | null, incoming: string | boolean | null) => {
      if (incoming === null || incoming === current) return
      if (current === null) fills.push(label)
      else conflicts.push(label)
    }
    if (name.toLowerCase() !== match.name.toLowerCase()) conflicts.push('Name')
    compare('Date of birth', match.dateOfBirth, fields.dateOfBirth)
    compare('Anniversary', match.anniversaryDate, fields.anniversaryDate)
    compare('WhatsApp opt-in', match.whatsappOptIn, fields.whatsappOptIn)
    if (tags.some((t) => !match.preferenceTags.includes(t))) fills.push('Tags')

    return {
      ...base,
      status: fills.length > 0 || conflicts.length > 0 ? 'update' : 'no_change',
      matchCustomerId: match.id,
      matchCustomerName: match.name,
      fills,
      conflicts,
    }
  })
  return { missingColumns: [], tooManyRows: false, rows }
}
