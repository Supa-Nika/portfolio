import { defineConfig } from 'vite';
export default defineConfig({
  resolve: { dedupe: ['three'] },
  worker: { format: 'es' },
});