import { resolve } from 'path';
import { defineConfig } from 'vite';
export default defineConfig({
  resolve: { dedupe: ['three'] },
  worker: { format: 'es' },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
      },
    },
  },
});