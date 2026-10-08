import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PLACEHOLDER manifest — brand color/icons are NOT YET FINALIZED per
    // docs/DESIGN_SYSTEM.md §4/§69. theme_color below is a neutral stand-in,
    // not the approved burgundy brand token; icons must be added once brand
    // assets are approved.
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Broastin Manager',
        short_name: 'Broastin Manager',
        description: 'Broastin CRM / Growth OS — Mobile Manager PWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f1f1f',
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
