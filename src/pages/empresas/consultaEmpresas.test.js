import { describe, expect, it } from 'vitest';
import { EMPRESAS_INICIAIS } from '../../data/empresas.js';
import { contarPorSituacao, consultarEmpresas, temFiltroAtivo } from './consultaEmpresas.js';

const nomes = (r) => r.itens.map((e) => e.nomeFantasia);

describe('consultarEmpresas', () => {
  it('mostra só as ativas por padrão, em ordem alfabética', () => {
    const r = consultarEmpresas(EMPRESAS_INICIAIS);
    expect(r.total).toBe(10);
    expect(nomes(r)[0]).toBe('AgroVale');
    expect(nomes(r)).not.toContain('Cria Educação');
    expect(r).toMatchObject({ de: 1, ate: 10, totalPaginas: 1 });
  });

  it('busca sem diferenciar acentos e maiúsculas, inclusive por contato e e-mail', () => {
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { busca: 'mare' }))).toEqual(['Maré Robotics']);
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { busca: 'DANIELA' }))).toEqual(['AgroVale']);
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '@kora.dev' }))).toEqual(['Kora']);
  });

  it('busca por CNPJ com ou sem pontuação', () => {
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '52.601.815' }))).toEqual(['Nexa Sensores']);
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { busca: '52601815' }))).toEqual(['Nexa Sensores']);
  });

  it('combina filtros de categoria, setor e responsável', () => {
    expect(nomes(consultarEmpresas(EMPRESAS_INICIAIS, { categoria: 'Incubada', setor: 'Energia' }))).toEqual(['Vetor Energia']);
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { responsavel: 'u2' }).total).toBe(3);
  });

  it('separa ativas, desativadas e todas', () => {
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { situacao: 'Desativada' }).total).toBe(2);
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { situacao: 'Todas' }).total).toBe(12);
    expect(contarPorSituacao(EMPRESAS_INICIAIS)).toEqual({ Ativa: 10, Desativada: 2, Todas: 12 });
  });

  it('ordena por contato em ordem decrescente', () => {
    const contatos = consultarEmpresas(EMPRESAS_INICIAIS, { ordem: 'contato', dir: 'desc' }).itens.map((e) => e.contatoNome);
    expect(contatos).toEqual([...contatos].sort((a, b) => b.localeCompare(a, 'pt-BR')));
  });

  it('ordena pela última interação como número, não como texto', () => {
    const dias = consultarEmpresas(EMPRESAS_INICIAIS, { ordem: 'ultima' }).itens.map((e) => e.diasSemInteracao);
    expect(dias).toEqual([...dias].sort((a, b) => a - b));
  });

  it('corrige página fora do intervalo e lida com base vazia', () => {
    expect(consultarEmpresas(EMPRESAS_INICIAIS, { pagina: 99 }).pagina).toBe(1);
    expect(consultarEmpresas([])).toMatchObject({ itens: [], total: 0, de: 0, ate: 0, totalPaginas: 1 });
  });
});

describe('temFiltroAtivo', () => {
  it('ignora aba de situação e ordenação', () => {
    expect(temFiltroAtivo({ situacao: 'Todas', ordem: 'email' })).toBe(false);
    expect(temFiltroAtivo({ setor: 'Saúde' })).toBe(true);
  });
});
