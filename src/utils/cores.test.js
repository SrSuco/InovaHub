import { describe, expect, it } from 'vitest';
import { CONTRASTE_MINIMO, CORES_DESTAQUE, hexParaOklch, luminanciaHex, razaoContraste, variaveisDestaque } from './cores.js';

describe('hexParaOklch', () => {
  it('converte branco e preto', () => {
    expect(hexParaOklch('#ffffff').L).toBeCloseTo(1, 3);
    expect(hexParaOklch('#000000').L).toBeCloseTo(0, 3);
  });

  it('converte o magenta do InovaParq para um tom de rosa-arroxeado', () => {
    const { L, H } = hexParaOklch('#AB218E');
    expect(L).toBeGreaterThan(0.45);
    expect(L).toBeLessThan(0.6);
    expect(H).toBeGreaterThan(320);
  });
});

describe('razaoContraste', () => {
  it('dá 21:1 entre branco e preto e 1:1 entre cores iguais', () => {
    const branco = luminanciaHex('#ffffff');
    const preto = luminanciaHex('#000000');
    expect(razaoContraste(branco, preto)).toBeCloseTo(21, 1);
    expect(razaoContraste(preto, branco)).toBeCloseTo(21, 1);
    expect(razaoContraste(branco, branco)).toBe(1);
  });
});

describe('variaveisDestaque', () => {
  const casos = CORES_DESTAQUE.flatMap((cor) => [
    [cor.nome, cor.hex, false],
    [cor.nome, cor.hex, true],
  ]);

  it.each(casos)('%s (%s, escuro: %s) tem contraste AA com o fundo e com o texto', (_nome, hex, escuro) => {
    const { contrasteFundo, contrasteTexto } = variaveisDestaque(hex, escuro);
    expect(contrasteFundo).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
    expect(contrasteTexto).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
  });

  it('mantém o magenta do InovaParq como está no modo claro', () => {
    const { L, C, H } = hexParaOklch('#AB218E');
    expect(variaveisDestaque('#AB218E', false).p).toBe(`${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}`);
  });

  it('usa texto branco no modo claro e escuro no modo escuro', () => {
    expect(variaveisDestaque('#AB218E', false).pc.startsWith('99%')).toBe(true);
    expect(variaveisDestaque('#AB218E', true).pc.startsWith('18%')).toBe(true);
  });

  it('clareia o destaque no modo escuro', () => {
    const luminosidade = (p) => parseFloat(p.split(' ')[0]);
    expect(luminosidade(variaveisDestaque('#AB218E', true).p)).toBeGreaterThan(luminosidade(variaveisDestaque('#AB218E', false).p));
  });

  it('corrige cores claras demais para o modo claro', () => {
    const { contrasteFundo, contrasteTexto } = variaveisDestaque('#FACC15', false);
    expect(contrasteFundo).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
    expect(contrasteTexto).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
  });
});
