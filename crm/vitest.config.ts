import path from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * Standalone from vite.config.ts on purpose — these are plain
 * service-logic unit tests (no DOM, no components), so the React/
 * Tailwind/PWA plugins used for the app build aren't needed here, and
 * keeping this file separate means `npm run dev`/`npm run build`
 * behavior is untouched by adding testing.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
  },
})
