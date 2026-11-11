import { describe, expect, it } from 'vitest';
import { validarUsuario } from './validacaoUsuario.js';

describe('validarUsuario', () => {
  it('exige nome, e-mail válido e perfil', () => {
    expect(validarUsuario({})).toMatchObject({ nome: 'Informe o nome.', email: expect.any(String), perfil: expect.any(String) });
  });

  it('exige senha temporária forte só quando essa opção é escolhida', () => {
    const base = { nome: 'Ana Souza', email: 'ana@univille.br', perfil: 'Analista' };
    expect(validarUsuario({ ...base, primeiroAcesso: 'convite' })).toEqual({});
    expect(validarUsuario({ ...base, primeiroAcesso: 'senha', senhaTemporaria: '123' })).toHaveProperty('senhaTemporaria');
  });
});
