import { consultar, emTransacao, pool } from '../db.js';
import { ErroHttp, erroValidacao, naoEncontrado } from '../erros.js';
import { dataHoraIso, dataOuNulo, formatarCnpj } from '../utils/formatacao.js';
import { somenteDigitos } from '../validacao.js';

/**
 * Acesso à tabela de empresas. Não existe função de exclusão:
 * empresas são apenas desativadas, e o histórico fica guardado.
 */

/** Campos editáveis: nome usado pelas telas → coluna no banco. */
const COLUNAS = {
  razaoSocial: 'razao_social',
  nomeFantasia: 'nome_fantasia',
  inscricaoEstadual: 'inscricao_estadual',
  dataFundacao: 'data_fundacao',
  porte: 'porte',
  site: 'site',
  categoria: 'categoria',
  setor: 'setor',
  responsavelId: 'responsavel_id',
  dataEntrada: 'data_entrada',
  contatoNome: 'contato_nome',
  contatoCargo: 'contato_cargo',
  email: 'email',
  telefone: 'telefone',
  cep: 'cep',
  logradouro: 'logradouro',
  numero: 'numero',
  complemento: 'complemento',
  bairro: 'bairro',
  cidade: 'cidade',
  uf: 'uf',
  observacoes: 'observacoes',
};
const DATAS = new Set(['dataFundacao', 'dataEntrada']);

/** Linha da visão vw_empresas → objeto usado pelas telas. */
export function paraEmpresa(l) {
  if (!l) return null;
  const empresa = { id: String(l.id), cnpj: formatarCnpj(l.cnpj ?? '') };
  for (const [campo, coluna] of Object.entries(COLUNAS)) empresa[campo] = l[coluna] ?? '';
  empresa.responsavelId = String(l.responsavel_id);
  empresa.situacao = l.situacao;
  empresa.desativacao = l.desativacao_motivo
    ? { motivo: l.desativacao_motivo, dataSaida: l.desativacao_data_saida, observacao: l.desativacao_observacao ?? '' }
    : null;
  empresa.diasSemInteracao = Number(l.dias_sem_interacao ?? 0);
  empresa.criadoEm = dataHoraIso(l.criado_em);
  empresa.atualizadoEm = dataHoraIso(l.atualizado_em);
  return empresa;
}

/** Valor de cada campo pronto para o banco. */
function valoresParaBanco(dados) {
  const valores = {};
  for (const [campo, coluna] of Object.entries(COLUNAS)) {
    if (!(campo in dados)) continue;
    let valor = dados[campo];
    if (DATAS.has(campo)) valor = dataOuNulo(valor);
    else if (campo === 'responsavelId') valor = Number(valor);
    else if (campo === 'uf') valor = String(valor ?? '').toUpperCase().slice(0, 2);
    else valor = typeof valor === 'string' ? valor.trim() : (valor ?? '');
    valores[coluna] = valor;
  }
  return valores;
}

export async function listar() {
  const linhas = await consultar('SELECT * FROM vw_empresas ORDER BY COALESCE(NULLIF(nome_fantasia, \'\'), razao_social)');
  return linhas.map(paraEmpresa);
}

/** Aceita uma conexão para ser usada dentro de uma transação. */
export async function buscarPorId(id, conexao = pool) {
  const [linhas] = await conexao.execute('SELECT * FROM vw_empresas WHERE id = ?', [Number(id) || 0]);
  return paraEmpresa(linhas[0]);
}

export async function obter(id) {
  const empresa = await buscarPorId(id);
  if (!empresa) throw naoEncontrado('Empresa não encontrada.');
  return empresa;
}

/** Outra empresa com o mesmo CNPJ (com ou sem pontuação). */
export async function buscarPorCnpj(cnpj) {
  const [linha] = await consultar('SELECT * FROM vw_empresas WHERE cnpj = ?', [somenteDigitos(cnpj)]);
  return paraEmpresa(linha);
}

async function garantirResponsavel(id) {
  const [linha] = await consultar(
    "SELECT id FROM usuarios WHERE id = ? AND situacao = 'Ativo'",
    [Number(id) || 0],
  );
  if (!linha) throw erroValidacao({ responsavelId: 'Escolha quem acompanha a empresa no parque.' });
}

export async function criar(dados, usuarioId) {
  const existente = await buscarPorCnpj(dados.cnpj);
  if (existente) {
    const desativada =
      existente.situacao === 'Desativada' ? ' (desativada; reative o cadastro em vez de criar outro)' : '';
    throw erroValidacao({
      cnpj: `Este CNPJ já está cadastrado para ${existente.nomeFantasia || existente.razaoSocial}${desativada}.`,
    });
  }
  await garantirResponsavel(dados.responsavelId);
  const valores = { ...valoresParaBanco(dados), cnpj: somenteDigitos(dados.cnpj), criado_por: usuarioId };
  const colunas = Object.keys(valores);
  const resultado = await consultar(
    `INSERT INTO empresas (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
    Object.values(valores),
  );
  return obter(resultado.insertId);
}

/** O CNPJ não muda depois do cadastro, e empresa desativada não pode ser editada. */
export async function atualizar(id, dados) {
  const atual = await obter(id);
  if (atual.situacao === 'Desativada') throw new ErroHttp(409, 'Reative a empresa antes de editar.');
  const { cnpj: _ignorado, ...resto } = dados;
  if ('responsavelId' in resto) await garantirResponsavel(resto.responsavelId);
  const valores = valoresParaBanco(resto);
  const colunas = Object.keys(valores);
  if (colunas.length) {
    await consultar(
      `UPDATE empresas SET ${colunas.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...Object.values(valores), Number(id)],
    );
  }
  return obter(id);
}

export async function desativar(id, { motivo, dataSaida, observacao = '' }, usuarioId) {
  return emTransacao(async (conexao) => {
    const empresa = await buscarPorId(id, conexao);
    if (!empresa) throw naoEncontrado('Empresa não encontrada.');
    if (empresa.situacao === 'Desativada') throw new ErroHttp(409, 'Esta empresa já está desativada.');
    await conexao.execute("UPDATE empresas SET situacao = 'Desativada' WHERE id = ?", [Number(id)]);
    await conexao.execute(
      `INSERT INTO empresa_desativacoes (empresa_id, motivo, data_saida, observacao, desativado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(id), motivo, dataSaida, observacao || null, usuarioId],
    );
    return buscarPorId(id, conexao);
  });
}

export async function reativar(id, usuarioId) {
  return emTransacao(async (conexao) => {
    const empresa = await buscarPorId(id, conexao);
    if (!empresa) throw naoEncontrado('Empresa não encontrada.');
    if (empresa.situacao === 'Ativa') return empresa;
    await conexao.execute("UPDATE empresas SET situacao = 'Ativa' WHERE id = ?", [Number(id)]);
    await conexao.execute(
      `UPDATE empresa_desativacoes SET reativado_em = NOW(), reativado_por = ?
        WHERE empresa_id = ? AND reativado_em IS NULL`,
      [usuarioId, Number(id)],
    );
    return buscarPorId(id, conexao);
  });
}
