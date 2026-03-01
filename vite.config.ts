import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.ico'],
      manifest: {
        id: '/publications/',
        name: 'مكتبة الصفوة',
        short_name: 'الصفوة',
        start_url: '/publications/',
        scope: '/publications/',
        display: 'standalone',
        theme_color: '#283593',
        background_color: '#fafafa',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: './icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: './icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: './icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-images',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 14,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      assets: '/src/assets',
      components: '/src/components',
      features: '/src/features',
      hooks: '/src/hooks',
      lib: '/src/lib',
      pages: '/src/pages',
      routes: '/src/routes',
      resources: '/src/resources',
      store: '/src/store',
      theme: '/src/theme',
      types: '/src/types',
      utils: '/src/utils',
    },
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: mode === 'development',
  },
  base: '/publications/',
}));
