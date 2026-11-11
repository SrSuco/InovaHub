/** Cálculos do dashboard a partir da lista de empresas. Funções puras, fáceis de testar. */

export const LIMITE_SEM_ACOMPANHAMENTO = 30;

export function calcularIndicadores(empresas) {
  const ativas = empresas.filter((e) => e.situacao === 'Ativa');
  const semAcompanhamento = ativas
    .filter((e) => (e.diasSemInteracao ?? 0) > LIMITE_SEM_ACOMPANHAMENTO)
    .sort((a, b) => b.diasSemInteracao - a.diasSemInteracao);

  return {
    ativas: ativas.length,
    incubadas: ativas.filter((e) => e.categoria === 'Incubada').length,
    preIncubadas: ativas.filter((e) => e.categoria === 'Pré-incubada').length,
    parceiras: ativas.filter((e) => ['Parceira', 'Investidor', 'Instituição'].includes(e.categoria)).length,
    semAcompanhamento,
  };
}

/** Conta empresas ativas por um campo (ex.: categoria ou setor), em ordem decrescente. */
export function contarPor(empresas, campo) {
  const contagem = new Map();
  for (const e of empresas) {
    if (e.situacao !== 'Ativa') continue;
    contagem.set(e[campo], (contagem.get(e[campo]) ?? 0) + 1);
  }
  return [...contagem.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
}

/** Interações registradas por mês (dados de exemplo até o módulo de interações existir). */
export const INTERACOES_POR_MES = {
  meses: ['jun', 'jul', 'ago', 'set', 'out', 'nov'],
  reunioes: [18, 22, 19, 27, 31, 14],
  mentorias: [9, 12, 15, 13, 17, 8],
};
