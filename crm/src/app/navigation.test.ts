import { describe, expect, test } from 'vitest'
import { navigationModules } from './navigation'
import routerSource from './router.tsx?raw'

/**
 * Regression guard: every menu and submenu link must have its own route.
 * Without one, a fixed path like /customers/vip falls through to the
 * /customers/:customerId detail route and shows "Customer not found".
 */
describe('navigation', () => {
  const routePaths = new Set([...routerSource.matchAll(/path: '([^']+)'/g)].map((m) => m[1]))

  const menuPaths = navigationModules.flatMap((m) => [m.path, ...(m.submenu ?? []).map((s) => s.path)])

  test.each(menuPaths)('%s has a dedicated route', (path) => {
    expect(routePaths.has(path.replace(/^\//, ''))).toBe(true)
  })
})
