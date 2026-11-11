import { describe, expect, it } from 'vitest';
import { formatarData } from './formatacao.js';

describe('formatarData', () => {
  it('formata datas no padrão brasileiro', () => {
    expect(formatarData('2026-11-11')).toBe('11/11/2026');
    expect(formatarData('2025-03-12T09:00:00')).toBe('12/03/2025');
  });
  it('devolve vazio para valores ausentes', () => {
    expect(formatarData('')).toBe('');
    expect(formatarData(null)).toBe('');
  });
});
