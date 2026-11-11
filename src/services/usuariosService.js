import { MATRIZ_PADRAO } from '../data/permissoes.js';
import { SENHA_DEMONSTRACAO, USUARIOS_INICIAIS } from '../data/usuarios.js';
import { aguardar, gravar, ler } from './armazenamento.js';
import { ErroApi, api, usaApi } from './clienteApi.js';

/**
 * Serviço de usuários, sessão e permissões. Com a API ligada (VITE_API_URL),
 * tudo passa pelo servidor; sem ela, fica no navegador (modo demonstração).
 */
const CHAVE = 'usuarios';

const todos = () => ler(CHAVE, USUARIOS_INICIAIS);
const salvarTodos = (lista) => gravar(CHAVE, lista);

/**
 * Confere usuário (login ou e-mail) e senha.
 * Devolve { usuario, matriz, token } ou lança erro genérico.
 */
export async function autenticar(identificador, senha, manterConectado = false) {
  if (usaApi) {
    try {
      return await api.post('/auth/login', { identificador, senha, manterConectado });
    } catch (erro) {
      if (erro.status === 401) throw new Error('Usuário ou senha incorretos.');
      throw erro;
    }
  }
  await aguardar(400);
  const termo = String(identificador ?? '').trim().toLowerCase();
  const usuario = todos().find(
    (u) => u.situacao === 'Ativo' && (u.login === termo || u.email.toLowerCase() === termo),
  );
  if (!usuario || senha !== SENHA_DEMONSTRACAO) {
    throw new Error('Usuário ou senha incorretos.');
  }
  return { usuario, matriz: ler('matriz', MATRIZ_PADRAO), token: null };
}

/** Relê usuário e matriz a partir do token salvo (só no modo API). */
export async function recuperarSessao() {
  return api.get('/auth/sessao');
}

export async function listarUsuarios() {
  if (usaApi) return api.get('/usuarios');
  await aguardar();
  return todos();
}

export async function obterUsuario(id) {
  if (usaApi) return api.get(`/usuarios/${encodeURIComponent(id)}`);
  await aguardar();
  const usuario = todos().find((u) => u.id === id);
  if (!usuario) throw new Error('Usuário não encontrado.');
  return usuario;
}

/**
 * Cria ou edita um usuário. No cadastro, `primeiroAcesso` diz se ele recebe
 * convite ou já entra com `senhaTemporaria`.
 */
export async function salvarUsuario({ primeiroAcesso, senhaTemporaria, ...dados }) {
  if (usaApi) {
    return dados.id
      ? api.put(`/usuarios/${encodeURIComponent(dados.id)}`, dados)
      : api.post('/usuarios', { ...dados, primeiroAcesso, senhaTemporaria });
  }
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
    situacao: primeiroAcesso === 'senha' ? 'Ativo' : 'Convite pendente',
    ultimoAcesso: '—',
  };
  salvarTodos([...lista, novo]);
  return novo;
}

export async function alterarSituacaoUsuario(id, situacao) {
  if (usaApi) return api.patch(`/usuarios/${encodeURIComponent(id)}/situacao`, { situacao });
  await aguardar();
  salvarTodos(todos().map((u) => (u.id === id ? { ...u, situacao } : u)));
}

/** Nome, cargo e telefone do usuário logado (tela Meu perfil). */
export async function atualizarMeuPerfil(usuario, dados) {
  if (usaApi) return api.put('/auth/perfil', dados);
  return salvarUsuario({ ...usuario, ...dados });
}

/** Troca a senha do usuário logado. No modo demonstração a senha é fixa. */
export async function alterarSenha({ atual, nova, confirmacao }) {
  if (usaApi) return api.put('/auth/senha', { atual, nova, confirmacao });
  await aguardar();
  if (atual !== SENHA_DEMONSTRACAO) {
    throw new ErroApi(422, 'A senha atual não confere.', { atual: 'A senha atual não confere.' });
  }
  return null;
}

/** Grava a matriz de permissões. */
export async function salvarMatrizPermissoes(matriz) {
  if (usaApi) return api.put('/permissoes', matriz);
  gravar('matriz', matriz);
  return matriz;
}

/** Usuários ativos da equipe, usados como "responsável no parque". */
export async function responsaveisDisponiveis() {
  if (usaApi) return api.get('/usuarios/responsaveis');
  return todos().filter((u) => u.situacao === 'Ativo' && u.vinculo === 'Equipe do parque');
}
