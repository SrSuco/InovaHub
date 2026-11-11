import { describe, expect, it } from 'vitest';
import { hexParaOklch } from './cores.js';

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
