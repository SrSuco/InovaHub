import { Router } from 'express';
import { ErroHttp, erroValidacao } from '../erros.js';
import { exigirLogin, gerarToken } from '../middlewares/autenticacao.js';
import { obterMatriz } from '../repositorios/permissoesRepositorio.js';
import * as usuarios from '../repositorios/usuariosRepositorio.js';
import { rota } from '../utils/rota.js';
import { validarNovaSenha } from '../validacao.js';

export const rotasAuth = Router();

/** POST /auth/login  { identificador, senha, manterConectado } */
rotasAuth.post(
  '/login',
  rota(async (req, res) => {
    const { identificador, senha, manterConectado = false } = req.body ?? {};
    const usuario = await usuarios.autenticar(identificador, senha);
    if (!usuario) throw new ErroHttp(401, 'Usuário ou senha incorretos.');
    res.json({ token: gerarToken(usuario, manterConectado), usuario, matriz: await obterMatriz() });
  }),
);

/** GET /auth/sessao: confere o token salvo e devolve usuário e matriz atualizados. */
rotasAuth.get(
  '/sessao',
  exigirLogin,
  rota(async (req, res) => {
    res.json({ usuario: req.usuario, matriz: await obterMatriz() });
  }),
);

/** PUT /auth/perfil: nome, cargo e telefone do próprio usuário. */
rotasAuth.put(
  '/perfil',
  exigirLogin,
  rota(async (req, res) => {
    const { nome, cargo, telefone } = req.body ?? {};
    if (String(nome ?? '').trim().length < 3) throw erroValidacao({ nome: 'Informe o nome.' });
    res.json(await usuarios.atualizarProprio(req.usuario.id, { nome, cargo, telefone }));
  }),
);

/** PUT /auth/senha  { atual, nova, confirmacao } */
rotasAuth.put(
  '/senha',
  exigirLogin,
  rota(async (req, res) => {
    const dados = { atual: '', nova: '', confirmacao: '', ...req.body };
    const erros = validarNovaSenha(dados);
    if (Object.keys(erros).length) throw erroValidacao(erros);
    await usuarios.alterarSenha(req.usuario.id, dados.atual, dados.nova);
    res.status(204).end();
  }),
);
