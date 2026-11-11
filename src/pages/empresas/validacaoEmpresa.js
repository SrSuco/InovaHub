import { cnpjValido, emailValido, somenteDigitos, urlValida } from '../../utils/validacao.js';

export const EMPRESA_VAZIA = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  inscricaoEstadual: '',
  dataFundacao: '',
  porte: '',
  site: '',
  categoria: '',
  setor: '',
  responsavelId: '',
  dataEntrada: '',
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
  observacoes: '',
};

/** Rótulos usados no resumo de erros do topo do formulário. */
export const ROTULOS = {
  cnpj: 'CNPJ',
  razaoSocial: 'Razão social',
  site: 'Site',
  categoria: 'Categoria',
  setor: 'Setor',
  responsavelId: 'Responsável no parque',
  contatoNome: 'Nome do contato',
  email: 'E-mail do contato',
  telefone: 'Telefone',
  cep: 'CEP',
  cidade: 'Cidade',
};

const texto = (v) => String(v ?? '').trim();

/**
 * Regras de cada campo. Devolvem a mensagem de erro ou null.
 * O CNPJ só é validado no cadastro: depois disso ele não pode ser alterado.
 */
const REGRAS = {
  cnpj: (v, modo) => {
    if (modo !== 'nova') return null;
    if (!somenteDigitos(v)) return 'Informe o CNPJ.';
    if (!cnpjValido(v)) return 'CNPJ inválido. Confira os 14 dígitos.';
    return null;
  },
  razaoSocial: (v) => (texto(v).length < 3 ? 'Informe a razão social, como está no cartão CNPJ.' : null),
  categoria: (v) => (texto(v) ? null : 'Escolha a categoria da empresa no parque.'),
  setor: (v) => (texto(v) ? null : 'Escolha o setor.'),
  responsavelId: (v) => (texto(v) ? null : 'Escolha quem acompanha a empresa no parque.'),
  site: (v) => (!texto(v) || urlValida(v) ? null : 'Use o endereço completo, como https://empresa.com.br.'),
  contatoNome: (v) => (texto(v).length < 3 ? 'Informe o nome do contato principal.' : null),
  email: (v) => {
    if (!texto(v)) return 'Informe o e-mail do contato.';
    return emailValido(v) ? null : 'E-mail inválido. Use o formato nome@empresa.com.br.';
  },
  telefone: (v) => {
    const digitos = somenteDigitos(v);
    if (!digitos) return 'Informe um telefone com DDD.';
    return digitos.length < 10 ? 'Telefone incompleto. Use DDD e número, como (47) 99999-0000.' : null;
  },
  cep: (v) => (texto(v) && somenteDigitos(v).length !== 8 ? 'CEP deve ter 8 dígitos.' : null),
  cidade: (v) => (texto(v) ? null : 'Informe a cidade.'),
};

/** Valida um único campo (usado ao sair do campo). */
export function validarCampo(campo, valor, modo = 'nova') {
  return REGRAS[campo] ? REGRAS[campo](valor, modo) : null;
}

/** Valida a empresa inteira. Devolve { campo: mensagem } só com os campos com erro. */
export function validarEmpresa(dados, modo = 'nova') {
  return Object.fromEntries(
    Object.keys(REGRAS)
      .map((campo) => [campo, validarCampo(campo, dados[campo], modo)])
      .filter(([, erro]) => erro),
  );
}
