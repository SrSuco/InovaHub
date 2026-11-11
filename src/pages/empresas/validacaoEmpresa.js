import { CATEGORIAS, PORTES, SETORES } from '../../data/opcoesEmpresa.js';
import {
  UFS,
  cepValido,
  cnpjValido,
  dataNaoFutura,
  emailValido,
  somenteDigitos,
  telefoneValido,
  urlValida,
} from '../../utils/validacao.js';

export const EMPRESA_VAZIA = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  dataFundacao: '',
  porte: '',
  setor: '',
  categoria: '',
  site: '',
  contatoNome: '',
  contatoCargo: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  responsavelId: '',
  dataEntrada: '',
  observacoes: '',
};

const texto = (v) => String(v ?? '').trim();
const obrigatorio = (rotulo) => (v) => (texto(v) ? null : `Informe ${rotulo}.`);
const tamanho = (min, max) => (v) => {
  const t = texto(v);
  if (!t) return null;
  if (t.length < min) return `Use pelo menos ${min} caracteres.`;
  if (t.length > max) return `Use no máximo ${max} caracteres.`;
  return null;
};
const opcao = (lista, rotulo) => (v) => (lista.includes(v) ? null : `Selecione ${rotulo}.`);

/**
 * Regras de cada campo. Cada regra devolve a mensagem de erro ou null.
 * A primeira regra que falhar define a mensagem mostrada.
 */
const REGRAS = {
  razaoSocial: [obrigatorio('a razão social'), tamanho(3, 120)],
  nomeFantasia: [obrigatorio('o nome fantasia'), tamanho(2, 60)],
  cnpj: [
    obrigatorio('o CNPJ'),
    (v) => (somenteDigitos(v).length === 14 ? null : 'O CNPJ deve ter 14 dígitos.'),
    (v) => (cnpjValido(v) ? null : 'CNPJ inválido. Confira os dígitos.'),
  ],
  inscricaoEstadual: [tamanho(0, 20)],
  dataFundacao: [(v) => (!v || dataNaoFutura(v) ? null : 'A data de fundação não pode estar no futuro.')],
  porte: [opcao(PORTES, 'o porte')],
  setor: [opcao(SETORES, 'o setor')],
  categoria: [opcao(CATEGORIAS, 'a categoria no parque')],
  site: [(v) => (!texto(v) || urlValida(v) ? null : 'Informe um endereço completo, começando com https://')],
  contatoNome: [obrigatorio('o nome do contato'), tamanho(3, 80)],
  contatoCargo: [tamanho(0, 60)],
  email: [obrigatorio('o e-mail'), (v) => (emailValido(v) ? null : 'E-mail inválido. Ex.: contato@empresa.com.br')],
  telefone: [
    obrigatorio('o telefone'),
    (v) => (telefoneValido(v) ? null : 'Telefone inválido. Use DDD + número, ex.: (47) 3461-9000.'),
  ],
  cep: [obrigatorio('o CEP'), (v) => (cepValido(v) ? null : 'O CEP deve ter 8 dígitos.')],
  logradouro: [obrigatorio('o logradouro')],
  numero: [
    obrigatorio('o número'),
    (v) => (/^(\d+[A-Za-z]?|S\/N)$/i.test(texto(v)) ? null : 'Use apenas números ou "S/N".'),
  ],
  bairro: [obrigatorio('o bairro')],
  cidade: [obrigatorio('a cidade')],
  uf: [opcao(UFS, 'a UF')],
  responsavelId: [obrigatorio('o responsável no parque')],
  dataEntrada: [(v) => (!v || dataNaoFutura(v) ? null : 'A data de entrada não pode estar no futuro.')],
  observacoes: [tamanho(0, 500)],
};

/** Valida um único campo. */
export function validarCampo(campo, valor) {
  for (const regra of REGRAS[campo] ?? []) {
    const erro = regra(valor);
    if (erro) return erro;
  }
  return null;
}

/** Valida a empresa inteira. Devolve um objeto { campo: mensagem } só com os campos com erro. */
export function validarEmpresa(dados) {
  return Object.fromEntries(
    Object.keys(REGRAS)
      .map((campo) => [campo, validarCampo(campo, dados[campo])])
      .filter(([, erro]) => erro),
  );
}
