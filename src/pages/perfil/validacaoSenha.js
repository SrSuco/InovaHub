/** Regras da nova senha, usadas na tela Meu perfil e na API. */
export function validarNovaSenha({ atual, nova, confirmacao }) {
  const erros = {};
  if (!atual) erros.atual = 'Informe a senha atual.';
  if (nova.length < 8) erros.nova = 'Use pelo menos 8 caracteres.';
  else if (!/\d/.test(nova) || !/[A-Za-z]/.test(nova)) erros.nova = 'Misture letras e números.';
  else if (nova === atual) erros.nova = 'A nova senha deve ser diferente da atual.';
  if (confirmacao !== nova) erros.confirmacao = 'As senhas não conferem.';
  return erros;
}
