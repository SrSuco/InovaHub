import { ACOES } from '../../data/permissoes.js';

/** Liga ou desliga uma ação de um módulo para um perfil. Ver (V) é pré-requisito das outras ações. */
export function alternarAcao(matriz, perfil, modulo, acao) {
  const atuais = matriz[perfil]?.[modulo] ?? '';
  let novas = atuais.includes(acao) ? atuais.replace(acao, '') : atuais + acao;
  if (acao === 'V' && !novas.includes('V')) novas = '';
  if (acao !== 'V' && novas && !novas.includes('V')) novas = `V${novas}`;
  const ordenadas = ACOES.map((a) => a.id).filter((id) => novas.includes(id)).join('');
  return { ...matriz, [perfil]: { ...matriz[perfil], [modulo]: ordenadas } };
}
