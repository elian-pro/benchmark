import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Use placeholder for runtime injection in Docker
    // Falls back to build-time env var for local development
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '__RUNTIME_API_KEY__')
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000
  }
});