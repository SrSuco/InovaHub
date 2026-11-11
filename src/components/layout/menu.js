/** Itens do menu lateral, agrupados por seção. `modulo` liga o item à matriz de permissões. */
export const MENU = [
  {
    titulo: 'Principal',
    itens: [{ rota: '/', nome: 'Dashboard', icone: 'home', modulo: 'dashboard', exato: true }],
  },
  {
    titulo: 'Cadastros',
    itens: [
      { rota: '/empresas', nome: 'Empresas', icone: 'building', modulo: 'empresas' },
      { nome: 'Contatos', icone: 'contact', emBreve: true },
      { nome: 'Oportunidades', icone: 'target', emBreve: true },
      { nome: 'Eventos', icone: 'calendar', emBreve: true },
    ],
  },
  {
    titulo: 'Análises',
    itens: [{ rota: '/relatorios', nome: 'Relatórios', icone: 'chart', modulo: 'relatorios' }],
  },
  {
    titulo: 'Administração',
    itens: [
      { rota: '/usuarios', nome: 'Usuários', icone: 'users', modulo: 'usuarios' },
      { rota: '/permissoes', nome: 'Permissões', icone: 'shieldok', modulo: 'permissoes' },
    ],
  },
  {
    titulo: 'Parque',
    itens: [{ rota: '/configuracoes', nome: 'Configurações', icone: 'cog', modulo: 'configuracoes' }],
  },
];
