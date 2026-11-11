import { somenteDigitos } from '../../utils/validacao.js';

export const ITENS_POR_PAGINA = 10;

/** Campos pelos quais a lista pode ser ordenada. */
export const ORDENACOES = [
  { id: 'nome', rotulo: 'Nome', campo: 'nomeFantasia' },
  { id: 'contato', rotulo: 'Contato', campo: 'contatoNome' },
  { id: 'email', rotulo: 'E-mail', campo: 'email' },
  { id: 'categoria', rotulo: 'Categoria', campo: 'categoria' },
  { id: 'cidade', rotulo: 'Cidade', campo: 'cidade' },
  { id: 'cadastro', rotulo: 'Data de cadastro', campo: 'criadoEm' },
];

export const FILTROS_PADRAO = {
  busca: '',
  categoria: '',
  setor: '',
  cidade: '',
  situacao: 'Ativa',
  ordem: 'nome',
  dir: 'asc',
  pagina: 1,
};

const normalizar = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Confere se a empresa contém o termo buscado em nome, razão social, CNPJ, contato ou e-mail. */
function combinaBusca(empresa, busca) {
  const termo = normalizar(busca);
  if (!termo) return true;
  const digitos = somenteDigitos(busca);
  const textos = [empresa.nomeFantasia, empresa.razaoSocial, empresa.contatoNome, empresa.email].map(normalizar);
  return textos.some((t) => t.includes(termo)) || (digitos.length >= 3 && somenteDigitos(empresa.cnpj).includes(digitos));
}

/**
 * Aplica busca, filtros, ordenação e paginação sobre a lista de empresas.
 * É uma função pura: recebe a lista e os filtros e devolve uma página de resultados.
 */
export function consultarEmpresas(empresas, filtros = {}) {
  const f = { ...FILTROS_PADRAO, ...filtros };

  const filtradas = empresas.filter(
    (e) =>
      combinaBusca(e, f.busca) &&
      (!f.categoria || e.categoria === f.categoria) &&
      (!f.setor || e.setor === f.setor) &&
      (!f.cidade || e.cidade === f.cidade) &&
      (!f.situacao || f.situacao === 'Todas' || e.situacao === f.situacao),
  );

  const campo = (ORDENACOES.find((o) => o.id === f.ordem) ?? ORDENACOES[0]).campo;
  const sentido = f.dir === 'desc' ? -1 : 1;
  const ordenadas = [...filtradas].sort(
    (a, b) => sentido * String(a[campo]).localeCompare(String(b[campo]), 'pt-BR', { sensitivity: 'base' }),
  );

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
