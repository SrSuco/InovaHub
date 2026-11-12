/**
 * Regras de acessibilidade e responsividade conferidas direto no código,
 * para evitar que voltem os problemas apontados pelo Lighthouse.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import configTailwind from '../tailwind.config.js';
import { luminanciaHex, razaoContraste } from './utils/cores.js';

const RAIZ = path.resolve(__dirname, '..');

function arquivosJsx(pasta) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) return arquivosJsx(caminho);
    return item.name.endsWith('.jsx') ? [caminho] : [];
  });
}

const fontes = arquivosJsx(path.join(RAIZ, 'src')).map((arquivo) => ({
  nome: path.relative(RAIZ, arquivo),
  codigo: fs.readFileSync(arquivo, 'utf8'),
}));

/** Lista as ocorrências de uma expressão em todos os .jsx, com arquivo e linha. */
function ocorrencias(regex) {
  return fontes.flatMap(({ nome, codigo }) =>
    codigo
      .split('\n')
      .map((linha, i) => (regex.test(linha) ? `${nome}:${i + 1}` : null))
      .filter(Boolean),
  );
}

describe('código das telas', () => {
  it('não usa opacidade abaixo de 70% em textos', () => {
    // Opacidade baixa deixa o texto abaixo do contraste de 4,5:1. Use a classe texto-suave.
    expect(ocorrencias(/(text-(xs|sm|base|\[\d+px\])[^"'`]*opacity-(10|20|30|40|50|60)\b)|(opacity-(10|20|30|40|50|60)[^"'`]*text-(xs|sm|base))/)).toEqual([]);
  });

  it('não esmaece linhas inteiras com opacidade', () => {
    // A opacidade da linha se soma à dos textos internos. Use a classe linha-desativada.
    expect(ocorrencias(/\? 'opacity-\d+'/)).toEqual([]);
  });

  it('não usa aria-label em elementos label', () => {
    expect(ocorrencias(/<label[^>]*aria-label=/)).toEqual([]);
  });

  it('dá texto alternativo, largura e altura a todas as imagens', () => {
    const imagens = fontes.flatMap(({ nome, codigo }) => (codigo.match(/<img\b[^>]*>/g) ?? []).map((tag) => ({ nome, tag })));
    for (const { nome, tag } of imagens) {
      expect(tag, nome).toMatch(/\balt=/);
      expect(tag, nome).toMatch(/\bwidth=/);
      expect(tag, nome).toMatch(/\bheight=/);
    }
  });

  it('usa h2 no título dos modais, logo abaixo do h1 da página', () => {
    const modal = fontes.find((f) => f.nome.endsWith(path.join('components', 'Modal.jsx')));
    expect(modal.codigo).toMatch(/<h2 id="modal-titulo"/);
  });
});

describe('cores do tema', () => {
  const temas = Object.assign({}, ...configTailwind.daisyui.themes);

  it.each(['info', 'success', 'warning', 'error'])('%s do tema claro tem contraste AA com o fundo e com o texto', (cor) => {
    const tema = temas.inovahub;
    const fundo = luminanciaHex(tema['base-100']);
    const valor = luminanciaHex(tema[cor]);
    expect(razaoContraste(valor, fundo)).toBeGreaterThanOrEqual(4.5);
    expect(razaoContraste(valor, luminanciaHex(tema[`${cor}-content`]))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['inovahub', 'inovahub-escuro'])('o texto principal do tema %s tem contraste AA com os fundos', (nome) => {
    const tema = temas[nome];
    const texto = luminanciaHex(tema['base-content']);
    for (const fundo of ['base-100', 'base-200']) {
      expect(razaoContraste(texto, luminanciaHex(tema[fundo]))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('página e arquivos públicos', () => {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

  it('declara idioma, viewport responsivo, descrição e título', () => {
    expect(html).toMatch(/<html lang="pt-BR">/);
    expect(html).toMatch(/<meta name="viewport" content="width=device-width, initial-scale=1(\.0)?"/);
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
  });

  it('não bloqueia o zoom no celular', () => {
    expect(html).not.toMatch(/user-scalable=no|maximum-scale=1/);
  });

  it('tem um robots.txt válido', () => {
    const robots = fs.readFileSync(path.join(RAIZ, 'public', 'robots.txt'), 'utf8');
    expect(robots).toMatch(/^User-agent: \*/m);
  });
});
