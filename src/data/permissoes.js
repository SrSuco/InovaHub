/** Ações possíveis em cada módulo. */
export const ACOES = [
  { id: 'V', nome: 'Ver' },
  { id: 'C', nome: 'Criar' },
  { id: 'E', nome: 'Editar' },
  { id: 'D', nome: 'Desativar' },
  { id: 'P', nome: 'Exportar' },
];

/** Módulos do sistema e as ações que fazem sentido em cada um. */
export const MODULOS = [
  { id: 'dashboard', nome: 'Dashboard', acoes: 'V' },
  { id: 'empresas', nome: 'Empresas', acoes: 'VCEDP' },
  { id: 'interacoes', nome: 'Interações', acoes: 'VCED' },
  { id: 'privadas', nome: 'Interações privadas', acoes: 'VCE' },
  { id: 'relatorios', nome: 'Relatórios', acoes: 'VP' },
  { id: 'usuarios', nome: 'Usuários', acoes: 'VCED' },
  { id: 'permissoes', nome: 'Permissões', acoes: 'VE' },
  { id: 'configuracoes', nome: 'Configurações do parque', acoes: 'VE' },
];

export const PERFIS = [
  {
    nome: 'Administrador',
    badge: 'badge-primary',
    descricao: 'Acesso total, inclusive usuários, permissões e desativação de empresas.',
  },
  {
    nome: 'Gerência',
    badge: 'badge-secondary',
    descricao: 'Vê e edita tudo, vê interações privadas e desativa empresas. Não gerencia usuários.',
  },
  {
    nome: 'Analista',
    badge: 'badge-info badge-outline',
    descricao: 'Cria e edita empresas e registra interações.',
  },
  {
    nome: 'Consulta',
    badge: 'badge-ghost',
    descricao: 'Somente leitura das empresas atribuídas, eventos e relatórios. Ideal para professores e avaliadores.',
  },
];

export const ADMINISTRADOR = 'Administrador';

/** Matriz padrão: perfil → módulo → ações permitidas. */
export const MATRIZ_PADRAO = {
  Administrador: Object.fromEntries(MODULOS.map((m) => [m.id, m.acoes])),
  'Gerência': {
    dashboard: 'V',
    empresas: 'VCEDP',
    interacoes: 'VCE',
    privadas: 'VCE',
    relatorios: 'VP',
    usuarios: '',
    permissoes: '',
    configuracoes: 'VE',
  },
  Analista: {
    dashboard: 'V',
    empresas: 'VCE',
    interacoes: 'VCE',
    privadas: '',
    relatorios: 'VP',
    usuarios: '',
    permissoes: '',
    configuracoes: '',
  },
  Consulta: {
    dashboard: 'V',
    empresas: 'V',
    interacoes: '',
    privadas: '',
    relatorios: 'V',
    usuarios: '',
    permissoes: '',
    configuracoes: '',
  },
};

/**
 * Diz se um perfil pode executar uma ação em um módulo.
 * O Administrador sempre pode tudo, independentemente da matriz.
 */
export function temPermissao(matriz, perfil, modulo, acao = 'V') {
  if (!perfil) return false;
  if (perfil === ADMINISTRADOR) return true;
  return (matriz?.[perfil]?.[modulo] ?? '').includes(acao);
}

/** Um perfil é somente leitura quando não pode criar nem editar em nenhum módulo. */
export function ehSomenteLeitura(matriz, perfil) {
  return !MODULOS.some(
    (m) => temPermissao(matriz, perfil, m.id, 'C') || temPermissao(matriz, perfil, m.id, 'E'),
  );
}

export const badgeDoPerfil = (nome) => PERFIS.find((p) => p.nome === nome)?.badge ?? 'badge-ghost';
