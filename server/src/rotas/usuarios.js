import { Router } from 'express';
import { erroValidacao } from '../erros.js';
import { exigirPermissao } from '../middlewares/autenticacao.js';
import * as usuarios from '../repositorios/usuariosRepositorio.js';
import { rota } from '../utils/rota.js';
import { validarUsuario } from '../validacao.js';

export const rotasUsuarios = Router();

const SITUACOES = ['Ativo', 'Convite pendente', 'Desativado'];

function validar(dados, editar) {
  const erros = validarUsuario(editar ? { ...dados, primeiroAcesso: 'convite' } : dados);
  if (Object.keys(erros).length) throw erroValidacao(erros);
}

/** Lista curta usada no campo "Responsável no parque". Basta estar logado. */
rotasUsuarios.get(
  '/responsaveis',
  rota(async (_req, res) => res.json(await usuarios.responsaveis())),
);

rotasUsuarios.get(
  '/',
  exigirPermissao('usuarios', 'V'),
  rota(async (_req, res) => res.json(await usuarios.listar())),
);

rotasUsuarios.get(
  '/:id',
  exigirPermissao('usuarios', 'V'),
  rota(async (req, res) => res.json(await usuarios.obter(req.params.id))),
);

rotasUsuarios.post(
  '/',
  exigirPermissao('usuarios', 'C'),
  rota(async (req, res) => {
    const dados = req.body ?? {};
    validar(dados, false);
    res.status(201).json(await usuarios.criar(dados));
  }),
);

rotasUsuarios.put(
  '/:id',
  exigirPermissao('usuarios', 'E'),
  rota(async (req, res) => {
    const dados = req.body ?? {};
    validar(dados, true);
    res.json(await usuarios.atualizar(req.params.id, dados));
  }),
);

/** Usuários não são excluídos: só mudam de situação. */
rotasUsuarios.patch(
  '/:id/situacao',
  exigirPermissao('usuarios', 'D'),
  rota(async (req, res) => {
    const { situacao } = req.body ?? {};
    if (!SITUACOES.includes(situacao)) throw erroValidacao({ situacao: 'Situação inválida.' });
    if (String(req.params.id) === String(req.usuario.id) && situacao !== 'Ativo') {
      throw erroValidacao({ situacao: 'Você não pode desativar o próprio acesso.' }, 'Você não pode desativar o próprio acesso.');
    }
    res.json(await usuarios.alterarSituacao(req.params.id, situacao));
  }),
);
