/**
 * Roda o Google Lighthouse nas telas principais, no celular e no computador,
 * e falha se alguma categoria ficar abaixo da nota mínima.
 *
 * Uso (depois de `npm run build`):
 *   npm run lighthouse
 *
 * Variáveis opcionais:
 *   LIGHTHOUSE_MINIMO=95        nota mínima de cada categoria (padrão 95)
 *   LIGHTHOUSE_TEMA=escuro      testa o modo escuro (padrão claro)
 *   LIGHTHOUSE_TELAS=login,dashboard   roda só as telas indicadas
 *   CHROME_PATH=/caminho/chrome        Chrome ou Chromium a usar
 *
 * As telas usam o modo demonstração. Os relatórios em HTML ficam em
 * `relatorios-lighthouse/`.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import configComputador from 'lighthouse/core/config/desktop-config.js';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';
import { USUARIOS_INICIAIS } from '../src/data/usuarios.js';

const MINIMO = Number(process.env.LIGHTHOUSE_MINIMO ?? 95);
const TEMA = process.env.LIGHTHOUSE_TEMA ?? 'claro';
const FILTRO = process.env.LIGHTHOUSE_TELAS?.split(',').map((t) => t.trim());
const PASTA = path.resolve('relatorios-lighthouse');
const CATEGORIAS = ['performance', 'accessibility', 'best-practices', 'seo'];
const NOMES = { performance: 'Desempenho', accessibility: 'Acessibilidade', 'best-practices': 'Boas práticas', seo: 'SEO' };

const TELAS = [
  { nome: 'login', rota: '/login', logado: false },
  { nome: 'dashboard', rota: '/' },
  { nome: 'empresas', rota: '/empresas' },
  { nome: 'empresa-nova', rota: '/empresas/nova' },
  { nome: 'ficha-empresa', rota: '/empresas/e1' },
  { nome: 'ficha-desativada', rota: '/empresas/e9' },
  { nome: 'usuarios', rota: '/usuarios' },
  { nome: 'usuario-novo', rota: '/usuarios/novo' },
  { nome: 'permissoes', rota: '/permissoes' },
  { nome: 'relatorios', rota: '/relatorios' },
  { nome: 'configuracoes', rota: '/configuracoes' },
  { nome: 'perfil', rota: '/perfil' },
  { nome: 'erro-404', rota: '/pagina-inexistente', logado: false },
].filter((t) => !FILTRO || FILTRO.includes(t.nome));

if (!fs.existsSync('dist/index.html')) {
  console.error('Rode "npm run build" antes de "npm run lighthouse".');
  process.exit(1);
}
fs.mkdirSync(PASTA, { recursive: true });

const servidor = await preview({ preview: { port: 4173, strictPort: false }, logLevel: 'silent' });
const base = servidor.resolvedUrls.local[0].replace(/\/$/, '');
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const navegador = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
const admin = USUARIOS_INICIAIS.find((u) => u.perfil === 'Administrador');

const resultados = [];
try {
  for (const tela of TELAS) {
    for (const dispositivo of ['celular', 'computador']) {
      // Abre uma página do site para gravar a sessão de demonstração.
      const pagina = await navegador.newPage();
      await pagina.goto(`${base}/login`);
      await pagina.evaluate(
        (usuario, tema) => {
          localStorage.clear();
          if (usuario) localStorage.setItem('inovahub:sessao', JSON.stringify({ usuario, token: null }));
          localStorage.setItem('inovahub:modo', JSON.stringify(tema));
        },
        tela.logado === false ? null : admin,
        TEMA,
      );
      const { lhr, report } = await lighthouse(
        base + tela.rota,
        { output: 'html', logLevel: 'error', disableStorageReset: true, onlyCategories: CATEGORIAS },
        dispositivo === 'computador' ? configComputador : undefined,
        pagina,
      );
      await pagina.close();
      fs.writeFileSync(path.join(PASTA, `${tela.nome}-${dispositivo}.html`), report);
      const notas = Object.fromEntries(CATEGORIAS.map((c) => [c, Math.round((lhr.categories[c].score ?? 0) * 100)]));
      resultados.push({ tela: tela.nome, dispositivo, ...notas });
      const abaixo = CATEGORIAS.filter((c) => notas[c] < MINIMO);
      const texto = CATEGORIAS.map((c) => `${NOMES[c]} ${notas[c]}`).join(' · ');
      console.log(`${abaixo.length ? '✗' : '✓'} ${tela.nome.padEnd(17)} ${dispositivo.padEnd(10)} ${texto}`);
    }
  }
} finally {
  await navegador.disconnect();
  chrome.kill();
  await new Promise((resolve) => servidor.httpServer.close(resolve));
}

fs.writeFileSync(path.join(PASTA, 'resumo.json'), JSON.stringify(resultados, null, 2));
const reprovadas = resultados.filter((r) => CATEGORIAS.some((c) => r[c] < MINIMO));
if (reprovadas.length) {
  console.error(`\n${reprovadas.length} verificação(ões) abaixo de ${MINIMO}. Veja os relatórios em ${PASTA}.`);
  process.exit(1);
}
console.log(`\nTodas as telas com nota ${MINIMO} ou mais (modo ${TEMA}).`);
