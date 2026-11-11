import { describe, expect, it } from 'vitest';
import { dataHoraIso, dataOuNulo, formatarCnpj, tempoRelativo } from '../src/utils/formatacao.js';

describe('formatarCnpj', () => {
  it('pontua os 14 dígitos', () => {
    expect(formatarCnpj('52601815000120')).toBe('52.601.815/0001-20');
  });
  it('devolve como está quando não tem 14 dígitos', () => {
    expect(formatarCnpj('123')).toBe('123');
    expect(formatarCnpj('')).toBe('');
  });
});

describe('tempoRelativo', () => {
  const agora = new Date('2026-11-11T12:00:00');
  it.each([
    [null, '—'],
    ['2026-11-11 11:58:00', 'agora'],
    ['2026-11-11 11:30:00', 'há 30 min'],
    ['2026-11-11 10:00:00', 'há 2 h'],
    ['2026-11-10 10:00:00', 'ontem'],
    ['2026-11-05 12:00:00', 'há 6 dias'],
    ['2026-07-11 12:00:00', 'há 4 meses'],
    ['2024-11-01 12:00:00', 'há 2 anos'],
  ])('%s → %s', (data, esperado) => {
    expect(tempoRelativo(data, agora)).toBe(esperado);
  });
});

describe('datas', () => {
  it('converte o formato do MySQL para o das telas', () => {
    expect(dataHoraIso('2025-03-12 09:00:00')).toBe('2025-03-12T09:00:00');
    expect(dataHoraIso(null)).toBe('');
  });
  it('troca data vazia por null', () => {
    expect(dataOuNulo('')).toBeNull();
    expect(dataOuNulo('2025-03-12')).toBe('2025-03-12');
  });
});
