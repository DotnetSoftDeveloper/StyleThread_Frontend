import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'], // Ensures compatibility with older browsers
    }),
  ],
  server: {
    port: 5176, // Change if needed
    strictPort: true, // Ensures Vite doesn't pick a different port if 5176 is in use
    open: true, // Auto-opens browser on server start
    cors: true, // Enables CORS for API calls
    hmr: {
      overlay: false // Disable error overlay if needed
    }
  },
  build: {
    outDir: 'dist', // Ensures build output goes to `dist/`
    sourcemap: true, // Helps with debugging
    assetsInlineLimit: 4096, // Adjust inline asset limit for performance
  },
  resolve: {
    alias: {
      '@': '/src', // Allows using `@` as an alias for `/src`
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif', '**/*.webp'],
});
