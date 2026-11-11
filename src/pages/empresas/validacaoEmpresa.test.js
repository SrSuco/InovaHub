import { describe, expect, it } from 'vitest';
import { EMPRESAS_INICIAIS } from '../../data/empresas.js';
import { EMPRESA_VAZIA, validarCampo, validarEmpresa } from './validacaoEmpresa.js';

describe('validarEmpresa', () => {
  it('aponta todos os campos obrigatórios de um formulário vazio', () => {
    const erros = validarEmpresa(EMPRESA_VAZIA);
    expect(Object.keys(erros).sort()).toEqual(
      [
        'razaoSocial', 'nomeFantasia', 'cnpj', 'porte', 'setor', 'categoria', 'contatoNome', 'email',
        'telefone', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf', 'responsavelId',
      ].sort(),
    );
    expect(erros.razaoSocial).toBe('Informe a razão social.');
  });

  it('aceita todas as empresas de exemplo', () => {
    for (const empresa of EMPRESAS_INICIAIS) {
      expect(validarEmpresa(empresa), empresa.nomeFantasia).toEqual({});
    }
  });
});

describe('validarCampo', () => {
  it('explica o erro do CNPJ', () => {
    expect(validarCampo('cnpj', '12.345')).toBe('O CNPJ deve ter 14 dígitos.');
    expect(validarCampo('cnpj', '12.345.678/0001-00')).toBe('CNPJ inválido. Confira os dígitos.');
  });

  it('aceita "S/N" no número e recusa texto livre', () => {
    expect(validarCampo('numero', 'S/N')).toBeNull();
    expect(validarCampo('numero', '120A')).toBeNull();
    expect(validarCampo('numero', 'perto da praça')).toBe('Use apenas números ou "S/N".');
  });

  it('limita observações a 500 caracteres', () => {
    expect(validarCampo('observacoes', 'a'.repeat(501))).toBe('Use no máximo 500 caracteres.');
  });

  it('não aceita site sem protocolo', () => {
    expect(validarCampo('site', 'empresa.com.br')).toMatch(/https:\/\//);
  });
});
