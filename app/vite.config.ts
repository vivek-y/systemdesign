import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/systemdesign/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'System Design Interview App',
        short_name: 'SysDesign',
        description: 'Practice system design interview questions offline',
        theme_color: '#1e293b',
        background_color: '#1e293b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/systemdesign/',
        start_url: '/systemdesign/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache JS/CSS/HTML/images/JSON — but NOT PDFs (let those go direct to network)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // Explicitly exclude PDFs from service worker interception
        navigateFallbackDenylist: [/\.pdf$/],
        runtimeCaching: [
          {
            // JSON data files
            urlPattern: /\/data\/.+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'design-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            // PDFs — always fetch from network, never cache
            urlPattern: /\.pdf$/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
