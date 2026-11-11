import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ErroHttp } from '../erros.js';
import { obterMatriz, temPermissao } from '../repositorios/permissoesRepositorio.js';
import { buscarPorId } from '../repositorios/usuariosRepositorio.js';

export function gerarToken(usuario, manterConectado = false) {
  return jwt.sign({ sub: usuario.id, perfil: usuario.perfil }, config.jwt.segredo, {
    expiresIn: manterConectado ? config.jwt.validadeLonga : config.jwt.validade,
  });
}

/**
 * Exige o cabeçalho "Authorization: Bearer <token>".
 * O usuário é relido do banco a cada chamada: quem foi desativado
 * ou mudou de perfil perde o acesso na hora.
 */
export async function exigirLogin(req, _res, next) {
  try {
    const [tipo, token] = String(req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new ErroHttp(401, 'Faça login para continuar.');
    let dados;
    try {
      dados = jwt.verify(token, config.jwt.segredo);
    } catch {
      throw new ErroHttp(401, 'Sua sessão expirou. Entre novamente.');
    }
    const usuario = await buscarPorId(dados.sub);
    if (!usuario || usuario.situacao !== 'Ativo') throw new ErroHttp(401, 'Sua sessão expirou. Entre novamente.');
    req.usuario = usuario;
    next();
  } catch (erro) {
    next(erro);
  }
}

/** Confere a matriz de permissões do perfil do usuário logado. */
export function exigirPermissao(modulo, acao = 'V') {
  return async (req, _res, next) => {
    try {
      const matriz = await obterMatriz();
      if (!temPermissao(matriz, req.usuario.perfil, modulo, acao)) {
        throw new ErroHttp(403, 'Seu perfil não tem permissão para esta ação.');
      }
      next();
    } catch (erro) {
      next(erro);
    }
  };
}
