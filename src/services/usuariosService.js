import { SENHA_DEMONSTRACAO, USUARIOS_INICIAIS } from '../data/usuarios.js';
import { aguardar, gravar, ler } from './armazenamento.js';

const CHAVE = 'usuarios';

const todos = () => ler(CHAVE, USUARIOS_INICIAIS);
const salvarTodos = (lista) => gravar(CHAVE, lista);

/** Confere usuário (login ou e-mail) e senha. Devolve o usuário ou lança erro genérico. */
export async function autenticar(identificador, senha) {
  await aguardar(400);
  const termo = String(identificador ?? '').trim().toLowerCase();
  const usuario = todos().find(
    (u) => u.situacao === 'Ativo' && (u.login === termo || u.email.toLowerCase() === termo),
  );
  if (!usuario || senha !== SENHA_DEMONSTRACAO) {
    throw new Error('Usuário ou senha incorretos.');
  }
  return usuario;
}

export async function listarUsuarios() {
  await aguardar();
  return todos();
}

export async function obterUsuario(id) {
  await aguardar();
  const usuario = todos().find((u) => u.id === id);
  if (!usuario) throw new Error('Usuário não encontrado.');
  return usuario;
}

export async function salvarUsuario(dados) {
  await aguardar();
  const lista = todos();
  const email = dados.email.trim().toLowerCase();
  if (lista.some((u) => u.email.toLowerCase() === email && u.id !== dados.id)) {
    const erro = new Error('Já existe um usuário com este e-mail.');
    erro.campos = { email: erro.message };
    throw erro;
  }
  if (dados.id) {
    const atualizado = { ...lista.find((u) => u.id === dados.id), ...dados, email };
    salvarTodos(lista.map((u) => (u.id === dados.id ? atualizado : u)));
    return atualizado;
  }
  const novo = {
    ...dados,
    email,
    id: `u${Date.now()}`,
    login: email.split('@')[0],
    situacao: 'Convite pendente',
    ultimoAcesso: '—',
  };
  salvarTodos([...lista, novo]);
  return novo;
}

export async function alterarSituacaoUsuario(id, situacao) {
  await aguardar();
  salvarTodos(todos().map((u) => (u.id === id ? { ...u, situacao } : u)));
}

/** Usuários ativos da equipe, usados como "responsável no parque". */
export function responsaveisDisponiveis() {
  return todos().filter((u) => u.situacao === 'Ativo' && u.vinculo === 'Equipe do parque');
}
