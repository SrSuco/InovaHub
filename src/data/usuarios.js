/**
 * Usuários de exemplo. A senha de todos é "inovahub".
 * Na integração com o back-end, este arquivo deixa de existir.
 */
export const SENHA_DEMONSTRACAO = 'inovahub';

export const USUARIOS_INICIAIS = [
  {
    id: 'u1',
    nome: 'Gabriel Nasário',
    login: 'admin',
    email: 'admin@inovaparq.univille.br',
    perfil: 'Administrador',
    situacao: 'Ativo',
    ultimoAcesso: 'agora',
    cargo: 'Estagiário de desenvolvimento',
    vinculo: 'Equipe do parque',
    telefone: '(47) 3461-9000',
  },
  {
    id: 'u2',
    nome: 'Carlos Mendes',
    login: 'gerencia',
    email: 'carlos.mendes@inovaparq.univille.br',
    perfil: 'Gerência',
    situacao: 'Ativo',
    ultimoAcesso: 'há 1 h',
    cargo: 'Gerente do parque',
    vinculo: 'Equipe do parque',
    telefone: '(47) 3461-9001',
  },
  {
    id: 'u3',
    nome: 'Marina Kowalski',
    login: 'analista',
    email: 'marina.k@inovaparq.univille.br',
    perfil: 'Analista',
    situacao: 'Ativo',
    ultimoAcesso: 'há 2 h',
    cargo: 'Analista de relacionamento',
    vinculo: 'Equipe do parque',
    telefone: '(47) 3461-9002',
  },
  {
    id: 'u4',
    nome: 'Rafael Teixeira',
    login: 'rafael',
    email: 'rafael.t@inovaparq.univille.br',
    perfil: 'Analista',
    situacao: 'Ativo',
    ultimoAcesso: 'ontem',
    cargo: 'Analista de projetos',
    vinculo: 'Equipe do parque',
    telefone: '(47) 3461-9003',
  },
  {
    id: 'u5',
    nome: 'Profa. Helena Duarte',
    login: 'consulta',
    email: 'helena.duarte@univille.br',
    perfil: 'Consulta',
    situacao: 'Ativo',
    ultimoAcesso: 'há 6 dias',
    cargo: 'Professora avaliadora',
    vinculo: 'Professor UNIVILLE',
    telefone: '',
  },
  {
    id: 'u6',
    nome: 'Beatriz Alves',
    login: 'beatriz',
    email: 'beatriz.alves@inovaparq.univille.br',
    perfil: 'Analista',
    situacao: 'Convite pendente',
    ultimoAcesso: '—',
    cargo: 'Analista de eventos',
    vinculo: 'Equipe do parque',
    telefone: '',
  },
  {
    id: 'u7',
    nome: 'João Pedro Lima',
    login: 'joao',
    email: 'joao.lima@inovaparq.univille.br',
    perfil: 'Analista',
    situacao: 'Desativado',
    ultimoAcesso: 'há 4 meses',
    cargo: 'Ex-estagiário',
    vinculo: 'Equipe do parque',
    telefone: '',
  },
];

export const iniciais = (nome = '') =>
  nome
    .replace(/^Profa?\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
