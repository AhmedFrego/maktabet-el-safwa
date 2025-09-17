import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      assets: '/src/assets',
      components: '/src/components',
      features: '/src/features',
      hooks: '/src/hooks',
      lib: '/src/lib',
      pages: '/src/pages',
      routes: '/src/routes',
      store: '/src/store',
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
  base: './',
}));
