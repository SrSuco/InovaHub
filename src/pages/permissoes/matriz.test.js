import { describe, expect, it } from 'vitest';
import { MATRIZ_PADRAO } from '../../data/permissoes.js';
import { alternarAcao } from './matriz.js';

describe('alternarAcao', () => {
  it('liga Ver junto quando outra ação é marcada', () => {
    const m = alternarAcao(MATRIZ_PADRAO, 'Consulta', 'usuarios', 'E');
    expect(m.Consulta.usuarios).toBe('VE');
  });

  it('remove todas as ações quando Ver é desmarcado', () => {
    const m = alternarAcao(MATRIZ_PADRAO, 'Analista', 'empresas', 'V');
    expect(m.Analista.empresas).toBe('');
  });

  it('mantém a ordem padrão das ações', () => {
    const m = alternarAcao(MATRIZ_PADRAO, 'Analista', 'empresas', 'D');
    expect(m.Analista.empresas).toBe('VCED');
  });
});
