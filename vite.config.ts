import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Reemplazo en build para no depender de `process` en el navegador.
    // Cadena vacía => la app cae al valor de localStorage en runtime.
    'process.env.ANTHROPIC_API_KEY': JSON.stringify(process.env.ANTHROPIC_API_KEY || ''),
    'process.env.ANTHROPIC_MODEL': JSON.stringify(process.env.ANTHROPIC_MODEL || '')
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