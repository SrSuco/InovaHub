import { describe, expect, it } from 'vitest';
import { EMPRESAS_INICIAIS } from '../../data/empresas.js';
import { EMPRESA_VAZIA, validarCampo, validarEmpresa } from './validacaoEmpresa.js';

describe('validarEmpresa', () => {
  it('aponta os campos obrigatórios de um formulário vazio', () => {
    const erros = validarEmpresa(EMPRESA_VAZIA, 'nova');
    expect(Object.keys(erros).sort()).toEqual(
      ['cnpj', 'razaoSocial', 'categoria', 'setor', 'responsavelId', 'contatoNome', 'email', 'telefone', 'cidade'].sort(),
    );
    expect(erros.razaoSocial).toBe('Informe a razão social, como está no cartão CNPJ.');
  });

  it('não valida o CNPJ na edição, porque ele não pode ser alterado', () => {
    expect(validarEmpresa({ ...EMPRESA_VAZIA, cnpj: '123' }, 'editar').cnpj).toBeUndefined();
  });

  it('aceita todas as empresas de exemplo', () => {
    for (const empresa of EMPRESAS_INICIAIS) {
      expect(validarEmpresa(empresa, 'nova'), empresa.nomeFantasia).toEqual({});
    }
  });
});

describe('validarCampo', () => {
  it('explica o erro do CNPJ', () => {
    expect(validarCampo('cnpj', '')).toBe('Informe o CNPJ.');
    expect(validarCampo('cnpj', '52.601.815/0001-21')).toBe('CNPJ inválido. Confira os 14 dígitos.');
  });

  it('diferencia telefone vazio de telefone incompleto', () => {
    expect(validarCampo('telefone', '')).toBe('Informe um telefone com DDD.');
    expect(validarCampo('telefone', '(47) 9912')).toMatch(/incompleto/);
    expect(validarCampo('telefone', '(47) 99912-0000')).toBeNull();
  });

  it('aceita CEP vazio, mas não incompleto', () => {
    expect(validarCampo('cep', '')).toBeNull();
    expect(validarCampo('cep', '8921')).toBe('CEP deve ter 8 dígitos.');
  });

  it('não aceita site sem protocolo nem e-mail sem domínio', () => {
    expect(validarCampo('site', 'aurorabio.com.br')).toMatch(/https:\/\//);
    expect(validarCampo('email', 'fernanda@aurorabio')).toMatch(/inválido/);
  });
});
