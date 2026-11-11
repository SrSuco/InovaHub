import { Router } from 'express';
import { erroValidacao } from '../erros.js';
import { exigirPermissao } from '../middlewares/autenticacao.js';
import { obterMatriz, salvarMatriz } from '../repositorios/permissoesRepositorio.js';
import { rota } from '../utils/rota.js';

export const rotasPermissoes = Router();

/** A matriz já vem no login; esta rota serve para recarregá-la. */
rotasPermissoes.get(
  '/',
  rota(async (_req, res) => res.json(await obterMatriz())),
);

rotasPermissoes.put(
  '/',
  exigirPermissao('permissoes', 'E'),
  rota(async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw erroValidacao({ matriz: 'Envie a matriz no formato { perfil: { modulo: "VCE" } }.' });
    }
    res.json(await salvarMatriz(req.body));
  }),
);
