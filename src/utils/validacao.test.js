import { describe, expect, it } from 'vitest';
import { cepValido, cnpjValido, dataNaoFutura, emailValido, telefoneValido, urlValida } from './validacao.js';

describe('cnpjValido', () => {
  it('aceita CNPJ válido com ou sem máscara', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11222333000181')).toBe(true);
  });

  it('recusa dígitos verificadores errados, tamanho errado e sequências repetidas', () => {
    expect(cnpjValido('11.222.333/0001-80')).toBe(false);
    expect(cnpjValido('1122233300018')).toBe(false);
    expect(cnpjValido('00.000.000/0000-00')).toBe(false);
  });
});

describe('emailValido', () => {
  it('valida o formato do e-mail', () => {
    expect(emailValido('contato@empresa.com.br')).toBe(true);
    expect(emailValido('contato@empresa')).toBe(false);
    expect(emailValido('contato empresa.com')).toBe(false);
  });
});

describe('telefoneValido', () => {
  it('aceita fixo com 10 dígitos e celular com 11 começando por 9', () => {
    expect(telefoneValido('(47) 3461-9000')).toBe(true);
    expect(telefoneValido('(47) 99876-5432')).toBe(true);
    expect(telefoneValido('(47) 89876-5432')).toBe(false);
    expect(telefoneValido('3461-9000')).toBe(false);
  });
});

describe('cepValido', () => {
  it('exige 8 dígitos', () => {
    expect(cepValido('89219-710')).toBe(true);
    expect(cepValido('8921971')).toBe(false);
  });
});

describe('urlValida', () => {
  it('exige http ou https e um domínio', () => {
    expect(urlValida('https://inovaparq.univille.br')).toBe(true);
    expect(urlValida('inovaparq.univille.br')).toBe(false);
    expect(urlValida('ftp://site.com')).toBe(false);
  });
});

describe('dataNaoFutura', () => {
  const hoje = new Date(2026, 10, 11);
  it('aceita hoje e datas passadas', () => {
    expect(dataNaoFutura('2026-11-11', hoje)).toBe(true);
    expect(dataNaoFutura('2020-01-01', hoje)).toBe(true);
  });
  it('recusa datas futuras e inválidas', () => {
    expect(dataNaoFutura('2026-11-12', hoje)).toBe(false);
    expect(dataNaoFutura('abc', hoje)).toBe(false);
  });
});
