import { EMPRESAS_INICIAIS } from '../data/empresas.js';
import { somenteDigitos } from '../utils/validacao.js';
import { aguardar, gravar, ler } from './armazenamento.js';
import { api, usaApi } from './clienteApi.js';

/**
 * Serviço de empresas. Com a API ligada (VITE_API_URL), os dados vêm do
 * MySQL; sem ela, ficam no navegador, no modo demonstração.
 * Não existe função de exclusão: empresas são apenas desativadas.
 */
const CHAVE = 'empresas';

const todas = () => ler(CHAVE, EMPRESAS_INICIAIS);
const salvarTodas = (lista) => gravar(CHAVE, lista);
const agora = () => new Date().toISOString().slice(0, 19);

/** Erro de regra de negócio ligado a um campo do formulário. */
export class ErroValidacao extends Error {
  constructor(campos) {
    super('Não foi possível salvar. Corrija os campos destacados.');
    this.campos = campos;
  }
}

/** Converte o erro 422 da API no mesmo ErroValidacao do modo demonstração. */
async function chamarApi(promessa) {
  try {
    return await promessa;
  } catch (erro) {
    if (erro.status === 422 && erro.campos) throw new ErroValidacao(erro.campos);
    throw erro;
  }
}

export async function listarEmpresas() {
  if (usaApi) return api.get('/empresas');
  await aguardar();
  return todas();
}

export async function obterEmpresa(id) {
  if (usaApi) return api.get(`/empresas/${encodeURIComponent(id)}`);
  await aguardar();
  const empresa = todas().find((e) => e.id === id);
  if (!empresa) throw new Error('Empresa não encontrada.');
  return empresa;
}

/** Procura outra empresa com o mesmo CNPJ (com ou sem pontuação). */
export function buscarPorCnpj(lista, cnpj, ignorarId) {
  const digitos = somenteDigitos(cnpj);
  return lista.find((e) => somenteDigitos(e.cnpj) === digitos && e.id !== ignorarId);
}

export async function criarEmpresa(dados) {
  if (usaApi) return chamarApi(api.post('/empresas', dados));
  await aguardar(400);
  const lista = todas();
  const existente = buscarPorCnpj(lista, dados.cnpj);
  if (existente) {
    const desativada = existente.situacao === 'Desativada' ? ' (desativada; reative o cadastro em vez de criar outro)' : '';
    throw new ErroValidacao({ cnpj: `Este CNPJ já está cadastrado para ${existente.nomeFantasia || existente.razaoSocial}${desativada}.` });
  }
  const nova = {
    ...dados,
    id: `e${Date.now()}`,
    situacao: 'Ativa',
    desativacao: null,
    diasSemInteracao: 0,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  salvarTodas([...lista, nova]);
  return nova;
}

export async function atualizarEmpresa(id, dados) {
  if (usaApi) return chamarApi(api.put(`/empresas/${encodeURIComponent(id)}`, dados));
  await aguardar(400);
  const lista = todas();
  const atual = lista.find((e) => e.id === id);
  if (!atual) throw new Error('Empresa não encontrada.');
  if (atual.situacao === 'Desativada') throw new Error('Reative a empresa antes de editar.');
  // O CNPJ não pode mudar depois do cadastro.
  const atualizada = { ...atual, ...dados, cnpj: atual.cnpj, id, atualizadoEm: agora() };
  salvarTodas(lista.map((e) => (e.id === id ? atualizada : e)));
  return atualizada;
}

export async function desativarEmpresa(id, { motivo, dataSaida, observacao = '' }) {
  if (!motivo) throw new ErroValidacao({ motivo: 'Escolha o motivo da desativação.' });
  if (usaApi) return chamarApi(api.post(`/empresas/${encodeURIComponent(id)}/desativar`, { motivo, dataSaida, observacao }));
  await aguardar();
  const lista = todas();
  const desativada = { situacao: 'Desativada', desativacao: { motivo, dataSaida, observacao }, atualizadoEm: agora() };
  salvarTodas(lista.map((e) => (e.id === id ? { ...e, ...desativada } : e)));
}

export async function reativarEmpresa(id) {
  if (usaApi) return api.post(`/empresas/${encodeURIComponent(id)}/reativar`);
  await aguardar();
  salvarTodas(todas().map((e) => (e.id === id ? { ...e, situacao: 'Ativa', desativacao: null, atualizadoEm: agora() } : e)));
}

/** Apaga todas as empresas da base local (só no modo demonstração, para mostrar a tela vazia). */
export async function esvaziarBaseDemonstracao() {
  salvarTodas([]);
}

export async function restaurarBaseDemonstracao() {
  salvarTodas(EMPRESAS_INICIAIS);
}

/* ---------- Bases de consulta (simuladas) ----------
 * No sistema real:
 *  - CNPJ: API pública da Receita, ex.: BrasilAPI  GET /api/cnpj/v1/{cnpj}
 *  - CEP:  ViaCEP                              GET /ws/{cep}/json/
 */
const BASE_CNPJ = {
  '11222333000181': {
    razaoSocial: 'Aurora Biotecnologia Ltda.',
    nomeFantasia: 'Aurora Bio',
    porte: 'Microempresa (ME)',
    dataFundacao: '2024-05-20',
    cep: '89219-710',
  },
};
const BASE_CEP = {
  89219710: { logradouro: 'Rua Paulo Malschitzki', bairro: 'Zona Industrial Norte', cidade: 'Joinville', uf: 'SC' },
  89251000: { logradouro: 'Rua Walter Marquardt', bairro: 'Barra do Rio Molha', cidade: 'Jaraguá do Sul', uf: 'SC' },
  88015200: { logradouro: 'Av. Rio Branco', bairro: 'Centro', cidade: 'Florianópolis', uf: 'SC' },
};

export async function consultarCnpj(cnpj) {
  await aguardar(500);
  const dados = BASE_CNPJ[somenteDigitos(cnpj)];
  if (!dados) throw new Error('CNPJ não encontrado na base pública. Preencha os dados manualmente.');
  return { ...dados, ...(BASE_CEP[somenteDigitos(dados.cep)] ?? {}) };
}

export async function consultarCep(cep) {
  await aguardar(300);
  const dados = BASE_CEP[somenteDigitos(cep)];
  if (!dados) throw new Error('CEP não encontrado. Preencha o endereço manualmente.');
  return dados;
}
