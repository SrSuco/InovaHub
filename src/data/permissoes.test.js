import { describe, expect, it } from 'vitest';
import { MATRIZ_PADRAO, ehSomenteLeitura, temPermissao } from './permissoes.js';

describe('temPermissao', () => {
  it('libera tudo para o Administrador', () => {
    expect(temPermissao({}, 'Administrador', 'usuarios', 'D')).toBe(true);
  });

  it('segue a matriz para os demais perfis', () => {
    expect(temPermissao(MATRIZ_PADRAO, 'Analista', 'empresas', 'C')).toBe(true);
    expect(temPermissao(MATRIZ_PADRAO, 'Analista', 'empresas', 'D')).toBe(false);
    expect(temPermissao(MATRIZ_PADRAO, 'Gerência', 'empresas', 'D')).toBe(true);
    expect(temPermissao(MATRIZ_PADRAO, 'Consulta', 'usuarios', 'V')).toBe(false);
  });

  it('nega acesso quando não há perfil', () => {
    expect(temPermissao(MATRIZ_PADRAO, null, 'dashboard')).toBe(false);
  });
});

describe('ehSomenteLeitura', () => {
  it('identifica o perfil Consulta como somente leitura', () => {
    expect(ehSomenteLeitura(MATRIZ_PADRAO, 'Consulta')).toBe(true);
    expect(ehSomenteLeitura(MATRIZ_PADRAO, 'Analista')).toBe(false);
  });
});
