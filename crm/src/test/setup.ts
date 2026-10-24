import { beforeEach } from 'vitest'

/**
 * Service tests run in Node, which has no localStorage. A shared
 * in-memory one stands in, living on globalThis so it survives the
 * vi.resetModules() calls most tests make. Every test starts signed in
 * as the seed Owner (user-001), since changing data requires sign-in;
 * auth tests switch user or sign out themselves.
 */
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }
}

globalThis.localStorage = new MemoryStorage()

export const TEST_OWNER_SESSION = { userId: 'user-001', name: 'Arjun Nair', roleLabel: 'Owner' }

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.localStorage.setItem('broastin-crm-session', JSON.stringify(TEST_OWNER_SESSION))
})
