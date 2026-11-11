import { describe, expect, it } from 'vitest';
import { mascararCep, mascararCnpj, mascararTelefone } from './mascaras.js';

describe('máscaras', () => {
  it('formata CNPJ enquanto o usuário digita', () => {
    expect(mascararCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(mascararCnpj('11222')).toBe('11.222');
    expect(mascararCnpj('11.222.333/0001-81xx')).toBe('11.222.333/0001-81');
  });

  it('formata CEP', () => {
    expect(mascararCep('89219710')).toBe('89219-710');
  });

  it('formata telefone fixo e celular', () => {
    expect(mascararTelefone('4734619000')).toBe('(47) 3461-9000');
    expect(mascararTelefone('47998765432')).toBe('(47) 99876-5432');
  });
});
