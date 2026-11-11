import mysql from 'mysql2/promise';
import { config } from './config.js';

/**
 * Pool de conexões com o MySQL. Todas as consultas usam parâmetros (?)
 * para evitar injeção de SQL. Datas voltam como texto ("2025-03-12")
 * para não sofrer conversão de fuso horário.
 */
export const pool = mysql.createPool({
  ...config.banco,
  charset: 'utf8mb4',
  dateStrings: true,
  connectionLimit: 10,
  waitForConnections: true,
});

/** Executa uma consulta e devolve só as linhas. */
export async function consultar(sql, parametros = []) {
  const [linhas] = await pool.execute(sql, parametros);
  return linhas;
}

/** Roda a função dentro de uma transação e faz rollback em caso de erro. */
export async function emTransacao(funcao) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await funcao(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
