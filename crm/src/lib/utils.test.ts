import { describe, expect, test } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  test('keeps custom text sizes alongside text colours', () => {
    expect(cn('text-caption font-medium', 'text-success')).toBe('text-caption font-medium text-success')
    expect(cn('text-caption', 'text-body')).toBe('text-body')
  })
})
