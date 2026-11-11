import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pacote from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [react()],
  define: {
    __VERSAO__: JSON.stringify(pacote.version),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
