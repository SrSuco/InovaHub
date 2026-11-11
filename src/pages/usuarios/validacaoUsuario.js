import { emailValido } from '../../utils/validacao.js';

export const VINCULOS = ['Equipe do parque', 'Professor UNIVILLE', 'Bolsista', 'Parceiro externo'];

/** Valida os dados de um usuário. Devolve { campo: mensagem }. */
export function validarUsuario(dados) {
  const erros = {};
  if (String(dados.nome ?? '').trim().length < 3) erros.nome = 'Informe o nome.';
  if (!emailValido(dados.email)) erros.email = 'Use um e-mail válido, de preferência @univille.br.';
  if (!dados.perfil) erros.perfil = 'Escolha um perfil de acesso.';
  if (dados.primeiroAcesso === 'senha' && String(dados.senhaTemporaria ?? '').length < 8) {
    erros.senhaTemporaria = 'A senha temporária precisa de pelo menos 8 caracteres.';
  }
  return erros;
}
