import { describe, expect, it } from 'vitest';
import { EMPRESAS_INICIAIS } from '../../data/empresas.js';
import { calcularIndicadores, contarPor } from './indicadores.js';

describe('calcularIndicadores', () => {
  const r = calcularIndicadores(EMPRESAS_INICIAIS);

  it('conta só empresas ativas', () => {
    expect(r.ativas).toBe(10);
    expect(r.incubadas).toBe(3);
    expect(r.preIncubadas).toBe(1);
  });

  it('lista as empresas sem interação há mais de 30 dias, da mais antiga para a mais recente', () => {
    expect(r.semAcompanhamento.map((e) => e.nomeFantasia)).toEqual(['Vetor Energia', 'Maré Robotics', 'Bioforma', 'Kora']);
  });
});

describe('contarPor', () => {
  it('agrupa empresas ativas por setor', () => {
    const porSetor = Object.fromEntries(contarPor(EMPRESAS_INICIAIS, 'setor'));
    expect(porSetor['Indústria 4.0']).toBe(2);
    expect(porSetor['Educação']).toBeUndefined();
  });
});
