import { Router } from 'express';
import { erroValidacao } from '../erros.js';
import { exigirPermissao } from '../middlewares/autenticacao.js';
import * as empresas from '../repositorios/empresasRepositorio.js';
import { rota } from '../utils/rota.js';
import { CATEGORIAS, MOTIVOS_DESATIVACAO, PORTES, SETORES, validarEmpresa } from '../validacao.js';

export const rotasEmpresas = Router();

/** Mesmas regras do formulário, mais as listas fechadas que o banco também confere. */
function validar(dados, modo) {
  const erros = validarEmpresa(dados, modo);
  if (dados.categoria && !erros.categoria && !CATEGORIAS.includes(dados.categoria)) {
    erros.categoria = 'Escolha a categoria da empresa no parque.';
  }
  if (dados.setor && !erros.setor && !SETORES.includes(dados.setor)) erros.setor = 'Escolha o setor.';
  if (dados.porte && !PORTES.includes(dados.porte)) erros.porte = 'Escolha o porte da empresa.';
  if (Object.keys(erros).length) throw erroValidacao(erros);
}

rotasEmpresas.get(
  '/',
  exigirPermissao('empresas', 'V'),
  rota(async (_req, res) => res.json(await empresas.listar())),
);

rotasEmpresas.get(
  '/:id',
  exigirPermissao('empresas', 'V'),
  rota(async (req, res) => res.json(await empresas.obter(req.params.id))),
);

rotasEmpresas.post(
  '/',
  exigirPermissao('empresas', 'C'),
  rota(async (req, res) => {
    const dados = req.body ?? {};
    validar(dados, 'nova');
    res.status(201).json(await empresas.criar(dados, Number(req.usuario.id)));
  }),
);

rotasEmpresas.put(
  '/:id',
  exigirPermissao('empresas', 'E'),
  rota(async (req, res) => {
    const dados = req.body ?? {};
    validar(dados, 'editar');
    res.json(await empresas.atualizar(req.params.id, dados));
  }),
);

/** Não existe DELETE: a empresa é desativada e o histórico fica. */
rotasEmpresas.post(
  '/:id/desativar',
  exigirPermissao('empresas', 'D'),
  rota(async (req, res) => {
    const { motivo, dataSaida, observacao = '' } = req.body ?? {};
    const erros = {};
    if (!MOTIVOS_DESATIVACAO.includes(motivo)) erros.motivo = 'Escolha o motivo da desativação.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dataSaida ?? ''))) erros.dataSaida = 'Informe a data de saída.';
    if (Object.keys(erros).length) throw erroValidacao(erros);
    res.json(await empresas.desativar(req.params.id, { motivo, dataSaida, observacao }, Number(req.usuario.id)));
  }),
);

rotasEmpresas.post(
  '/:id/reativar',
  exigirPermissao('empresas', 'D'),
  rota(async (req, res) => res.json(await empresas.reativar(req.params.id, Number(req.usuario.id)))),
);
