import { describe, expect, it } from 'vitest';
import { EMPRESAS_INICIAIS } from '../../data/empresas.js';
import { consultarEmpresas } from './consultaEmpresas.js';

const ativas = EMPRESAS_INICIAIS.filter((e) => e.situacao === 'Ativa');

describe('consultarEmpresas', () => {
  it('mostra só as ativas por padrão, 10 por página, em ordem alfabética', () => {
    const r = consultarEmpresas(EMPRESAS_INICIAIS);
    expect(r.total).toBe(ativas.length);
    expect(r.itens).toHaveLength(10);
    expect(r.itens[0].nomeFantasia).toBe('AgroVale');
    expect(r.de).toBe(1);
    expect(r.ate).toBe(10);
  });

  it('busca sem diferenciar acentos e maiúsculas, inclusive por contato e e-mail', () => {
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { busca: 'mare' }).itens[0].nomeFantasia).toBe('Maré Robotics');
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { busca: 'JULIANA' }).total).toBe(1);
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '@kora.dev' }).total).toBe(1);
  });

  it('busca por CNPJ com ou sem máscara', () => {
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '12.345.678' }).itens[0].nomeFantasia).toBe('Nexa Sensores');
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '12345678' }).total).toBe(1);
  });

  it('combina filtros de categoria, setor e situação', () => {
    const r = consultarEmpresas(EMPRESAS_INICIAIS, { categoria: 'Incubada', setor: 'Software' });
    expect(r.itens.map((e) => e.nomeFantasia)).toEqual(['Mosaico']);
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { situacao: 'Inativa' }).total).toBe(2);
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { situacao: 'Todas' }).total).toBe(EMPRESAS_INICIAIS.length);
  });

  it('ordena por contato em ordem decrescente', () => {
    const r = consultarEmpresas(EMPRESAS_INICIAIS, { ordem: 'contato', dir: 'desc' });
    const nomes = r.itens.map((e) => e.contatoNome);
    expect(nomes).toEqual([...nomes].sort((a, b) => b.localeCompare(a, 'pt-BR')));
  });

  it('corrige página fora do intervalo', () => {
    const r = consultarEmpresas(EMPRESAS_INICIAIS, { pagina: 99 });
    expect(r.pagina).toBe(r.totalPaginas);
  });

  it('devolve lista vazia sem erro quando não há empresas', () => {
    expect(consultarEmpresas([])).toMatchObject({ itens: [], total: 0, de: 0, ate: 0, totalPaginas: 1 });
  });
});
