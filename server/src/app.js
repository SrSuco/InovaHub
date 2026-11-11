import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { consultar } from './db.js';
import { exigirLogin } from './middlewares/autenticacao.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erros.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasEmpresas } from './rotas/empresas.js';
import { rotasPermissoes } from './rotas/permissoes.js';
import { rota } from './utils/rota.js';

export function criarApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigem }));
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();

  /** Verifica se a API está no ar e se o banco responde. */
  api.get(
    '/saude',
    rota(async (_req, res) => {
      await consultar('SELECT 1');
      res.json({ status: 'ok', banco: 'conectado' });
    }),
  );

  api.use('/auth', rotasAuth);
  api.use('/empresas', exigirLogin, rotasEmpresas);
  api.use('/permissoes', exigirLogin, rotasPermissoes);

  app.use('/api', api);
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);
  return app;
}
