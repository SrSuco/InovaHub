import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { consultar } from '../db.js';
import { erroValidacao, naoEncontrado } from '../erros.js';
import { tempoRelativo } from '../utils/formatacao.js';

const CAMPOS = `u.id, u.nome, u.login, u.email, u.situacao, u.cargo, u.vinculo, u.telefone,
                u.ultimo_acesso, p.nome AS perfil`;
const DE = 'FROM usuarios u JOIN perfis p ON p.id = u.perfil_id';

/** Linha do banco → objeto usado pelas telas. A senha nunca sai daqui. */
export function paraUsuario(linha) {
  if (!linha) return null;
  return {
    id: String(linha.id),
    nome: linha.nome,
    login: linha.login,
    email: linha.email,
    perfil: linha.perfil,
    situacao: linha.situacao,
    ultimoAcesso: tempoRelativo(linha.ultimo_acesso),
    cargo: linha.cargo,
    vinculo: linha.vinculo,
    telefone: linha.telefone,
  };
}

export async function listar() {
  const linhas = await consultar(`SELECT ${CAMPOS} ${DE} ORDER BY u.nome`);
  return linhas.map(paraUsuario);
}

export async function buscarPorId(id) {
  const [linha] = await consultar(`SELECT ${CAMPOS} ${DE} WHERE u.id = ?`, [Number(id) || 0]);
  return paraUsuario(linha);
}

export async function obter(id) {
  const usuario = await buscarPorId(id);
  if (!usuario) throw naoEncontrado('Usuário não encontrado.');
  return usuario;
}

/** Confere login (ou e-mail) e senha. Só usuários ativos entram. */
export async function autenticar(identificador, senha) {
  const termo = String(identificador ?? '').trim().toLowerCase();
  const [linha] = await consultar(
    `SELECT ${CAMPOS}, u.senha_hash ${DE} WHERE LOWER(u.login) = ? OR LOWER(u.email) = ?`,
    [termo, termo],
  );
  const confere = linha ? await bcrypt.compare(String(senha ?? ''), linha.senha_hash) : false;
  if (!confere || linha.situacao !== 'Ativo') return null;
  await consultar('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [linha.id]);
  return paraUsuario({ ...linha, ultimo_acesso: new Date() });
}

/** Usuários ativos da equipe, usados como "responsável no parque". */
export async function responsaveis() {
  const linhas = await consultar(
    `SELECT ${CAMPOS} ${DE} WHERE u.situacao = 'Ativo' AND u.vinculo = 'Equipe do parque' ORDER BY u.nome`,
  );
  return linhas.map(paraUsuario);
}

async function idDoPerfil(nome) {
  const [linha] = await consultar('SELECT id FROM perfis WHERE nome = ?', [nome]);
  if (!linha) throw erroValidacao({ perfil: 'Escolha um perfil de acesso.' });
  return linha.id;
}

async function garantirEmailUnico(email, ignorarId = 0) {
  const [existe] = await consultar('SELECT id FROM usuarios WHERE LOWER(email) = ? AND id <> ?', [email, Number(ignorarId)]);
  if (existe) throw erroValidacao({ email: 'Já existe um usuário com este e-mail.' }, 'Já existe um usuário com este e-mail.');
}

/** Gera um login livre a partir do e-mail: marina.k, marina.k2, ... */
async function loginLivre(email) {
  const base = email.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 50) || 'usuario';
  for (let n = 1; ; n += 1) {
    const login = n === 1 ? base : `${base}${n}`;
    const [existe] = await consultar('SELECT id FROM usuarios WHERE login = ?', [login]);
    if (!existe) return login;
  }
}

/**
 * Cria um usuário. Com senha temporária ele já entra ativo; sem ela, fica
 * com o convite pendente até alguém definir a senha.
 */
export async function criar(dados) {
  const email = dados.email.trim().toLowerCase();
  await garantirEmailUnico(email);
  const perfilId = await idDoPerfil(dados.perfil);
  const temSenha = dados.primeiroAcesso === 'senha' && dados.senhaTemporaria;
  const senha = temSenha ? dados.senhaTemporaria : randomBytes(24).toString('hex');
  const hash = await bcrypt.hash(senha, 10);
  const resultado = await consultar(
    `INSERT INTO usuarios (nome, login, email, senha_hash, perfil_id, situacao, cargo, vinculo, telefone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dados.nome.trim(),
      await loginLivre(email),
      email,
      hash,
      perfilId,
      temSenha ? 'Ativo' : 'Convite pendente',
      dados.cargo ?? '',
      dados.vinculo ?? 'Equipe do parque',
      dados.telefone ?? '',
    ],
  );
  return obter(resultado.insertId);
}

export async function atualizar(id, dados) {
  await obter(id);
  const email = dados.email.trim().toLowerCase();
  await garantirEmailUnico(email, id);
  const perfilId = await idDoPerfil(dados.perfil);
  await consultar(
    'UPDATE usuarios SET nome = ?, email = ?, perfil_id = ?, cargo = ?, vinculo = ?, telefone = ? WHERE id = ?',
    [dados.nome.trim(), email, perfilId, dados.cargo ?? '', dados.vinculo ?? 'Equipe do parque', dados.telefone ?? '', Number(id)],
  );
  return obter(id);
}

/** Dados que o próprio usuário pode mudar em "Meu perfil". */
export async function atualizarProprio(id, { nome, cargo, telefone }) {
  await consultar('UPDATE usuarios SET nome = ?, cargo = ?, telefone = ? WHERE id = ?', [
    String(nome ?? '').trim(),
    cargo ?? '',
    telefone ?? '',
    Number(id),
  ]);
  return obter(id);
}

export async function alterarSituacao(id, situacao) {
  await obter(id);
  await consultar('UPDATE usuarios SET situacao = ? WHERE id = ?', [situacao, Number(id)]);
  return obter(id);
}

export async function alterarSenha(id, atual, nova) {
  const [linha] = await consultar('SELECT senha_hash FROM usuarios WHERE id = ?', [Number(id)]);
  if (!linha || !(await bcrypt.compare(String(atual ?? ''), linha.senha_hash))) {
    throw erroValidacao({ atual: 'A senha atual não confere.' }, 'A senha atual não confere.');
  }
  await consultar('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [await bcrypt.hash(nova, 10), Number(id)]);
}
