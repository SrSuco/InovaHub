import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import pacote from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      __VERSAO__: JSON.stringify(pacote.version),
    },
    server: {
      // Em desenvolvimento, as chamadas para /api vão para a API local.
      proxy: {
        '/api': env.API_PROXY || 'http://localhost:3333',
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
    },
  };
});
