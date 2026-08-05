import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        // Capacitor native-only plugins — resolved at runtime by the Android
        // native layer, never by the web bundler. The isNativePlatform() guards
        // in gcal.js and health-connect.js mean these are never called on web.
        '@codetrix-studio/capacitor-google-auth',
        '@capgo/capacitor-health',
      ],
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, '')
      }
    }
  },
});
