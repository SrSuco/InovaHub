import { consultar, emTransacao } from '../db.js';
import { ADMINISTRADOR, MODULOS } from '../validacao.js';

/** Matriz { perfil: { modulo: "VCE" } }, no mesmo formato usado pelas telas. */
export async function obterMatriz() {
  const linhas = await consultar(
    `SELECT p.nome AS perfil, m.id AS modulo, COALESCE(pm.acoes, '') AS acoes
       FROM perfis p
       CROSS JOIN modulos m
       LEFT JOIN permissoes pm ON pm.perfil_id = p.id AND pm.modulo_id = m.id
      ORDER BY p.ordem, m.ordem`,
  );
  const matriz = {};
  for (const { perfil, modulo, acoes } of linhas) {
    matriz[perfil] ??= {};
    matriz[perfil][modulo] = acoes;
  }
  return matriz;
}

/** O Administrador sempre pode tudo, como na tela de permissões. */
export function temPermissao(matriz, perfil, modulo, acao = 'V') {
  if (!perfil) return false;
  if (perfil === ADMINISTRADOR) return true;
  return (matriz?.[perfil]?.[modulo] ?? '').includes(acao);
}

/**
 * Grava a matriz recebida. Ações fora das possíveis em cada módulo são
 * descartadas, e a linha do Administrador nunca é alterada.
 */
export async function salvarMatriz(matriz) {
  const perfis = await consultar('SELECT id, nome FROM perfis');
  await emTransacao(async (conexao) => {
    for (const { id, nome } of perfis) {
      if (nome === ADMINISTRADOR || !matriz?.[nome]) continue;
      for (const modulo of MODULOS) {
        const pedidas = String(matriz[nome][modulo.id] ?? '');
        const acoes = [...modulo.acoes].filter((a) => pedidas.includes(a)).join('');
        await conexao.execute(
          `INSERT INTO permissoes (perfil_id, modulo_id, acoes) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE acoes = VALUES(acoes)`,
          [id, modulo.id, acoes],
        );
      }
    }
  });
  return obterMatriz();
}
