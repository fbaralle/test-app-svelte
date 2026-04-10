import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// User's custom Vite configuration
export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
  },
});
