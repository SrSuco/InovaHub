import { somenteDigitos } from '../../utils/validacao.js';

export const ITENS_POR_PAGINA = 10;

/** Campos pelos quais a lista pode ser ordenada. */
export const ORDENACOES = [
  { id: 'nome', rotulo: 'Nome', valor: (e) => e.nomeFantasia || e.razaoSocial },
  { id: 'contato', rotulo: 'Contato', valor: (e) => e.contatoNome },
  { id: 'email', rotulo: 'E-mail', valor: (e) => e.email },
  { id: 'categoria', rotulo: 'Categoria', valor: (e) => e.categoria },
  { id: 'ultima', rotulo: 'Última interação', valor: (e) => e.diasSemInteracao ?? 0 },
  { id: 'cadastro', rotulo: 'Data de cadastro', valor: (e) => e.criadoEm },
];

/** Abas de situação da listagem. */
export const ABAS_SITUACAO = [
  { id: 'Ativa', rotulo: 'Ativas' },
  { id: 'Desativada', rotulo: 'Desativadas' },
  { id: 'Todas', rotulo: 'Todas' },
];

export const FILTROS_PADRAO = {
  busca: '',
  categoria: '',
  setor: '',
  responsavel: '',
  situacao: 'Ativa',
  ordem: 'nome',
  dir: 'asc',
  pagina: 1,
};

export const normalizar = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Nome exibido na listagem: o nome fantasia ou, se vazio, a razão social. */
export const nomeExibido = (empresa) => empresa.nomeFantasia || empresa.razaoSocial;

/** Confere se a empresa contém o termo em nome, razão social, contato, e-mail ou CNPJ. */
function combinaBusca(empresa, busca) {
  const termo = normalizar(busca);
  if (!termo) return true;
  const digitos = somenteDigitos(busca);
  const textos = [empresa.nomeFantasia, empresa.razaoSocial, empresa.contatoNome, empresa.email].map(normalizar);
  return textos.some((t) => t.includes(termo)) || (digitos.length > 0 && somenteDigitos(empresa.cnpj).includes(digitos));
}

/** Há algum filtro (além da aba de situação e da ordenação) aplicado? */
export const temFiltroAtivo = (f) => Boolean(f.busca || f.categoria || f.setor || f.responsavel);

/** Quantidade de empresas em cada aba de situação. */
export function contarPorSituacao(empresas) {
  const ativas = empresas.filter((e) => e.situacao === 'Ativa').length;
  return { Ativa: ativas, Desativada: empresas.length - ativas, Todas: empresas.length };
}

/**
 * Aplica busca, filtros, ordenação e paginação sobre a lista de empresas.
 * Função pura: recebe a lista e os filtros e devolve uma página de resultados.
 */
export function consultarEmpresas(empresas, filtros = {}) {
  const f = { ...FILTROS_PADRAO, ...filtros };

  const filtradas = empresas.filter(
    (e) =>
      combinaBusca(e, f.busca) &&
      (!f.categoria || e.categoria === f.categoria) &&
      (!f.setor || e.setor === f.setor) &&
      (!f.responsavel || e.responsavelId === f.responsavel) &&
      (f.situacao === 'Todas' || !f.situacao || e.situacao === f.situacao),
  );

  const { valor } = ORDENACOES.find((o) => o.id === f.ordem) ?? ORDENACOES[0];
  const sentido = f.dir === 'desc' ? -1 : 1;
  const ordenadas = [...filtradas].sort((a, b) => {
    const x = valor(a);
    const y = valor(b);
    const r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR', { sensitivity: 'base' });
    return sentido * r;
  });

  const total = ordenadas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(f.pagina) || 1), totalPaginas);
  const inicio = (pagina - 1) * ITENS_POR_PAGINA;

  return {
    itens: ordenadas.slice(inicio, inicio + ITENS_POR_PAGINA),
    total,
    pagina,
    totalPaginas,
    de: total ? inicio + 1 : 0,
    ate: Math.min(inicio + ITENS_POR_PAGINA, total),
  };
}
