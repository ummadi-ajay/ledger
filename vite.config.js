import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Use /ledger/ for production (GitHub Pages), / for development
const base = './'

export default defineConfig({
  base: base,

  plugins: [
    react(),
    /*
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      includeAssets: ['vite.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Transaction Ledger - Finance Tracker',
        short_name: 'Ledger',
        description: 'Track your income, expenses, and manage your finances with beautiful charts and insights',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ledger/',
        start_url: '/ledger/',
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        share_target: {
          action: '/ledger/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [
              {
                name: 'receipt',
                accept: ['image/*']
              }
            ]
          }
        }
      }
    })
    */
  ],
})
