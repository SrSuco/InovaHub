import { defineConfig } from 'vitest/config';

export default defineConfig({
  // A API não tem CSS. Sem isto, o Vite procura o postcss.config.js da raiz
  // e falha quando as dependências das telas não estão instaladas.
  css: { postcss: {} },
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    // Os testes de integração usam um banco separado, recriado a cada execução.
    env: { DB_NOME: process.env.DB_NOME_TESTE ?? 'inovahub_teste', JWT_SEGREDO: 'segredo-de-teste' },
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
