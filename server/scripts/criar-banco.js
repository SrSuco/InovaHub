/**
 * Cria o banco definido no .env e roda database/schema.sql e database/seed.sql.
 * Atenção: recria todas as tabelas. Use só em desenvolvimento.
 *
 *   npm run db:criar             esquema + carga inicial
 *   npm run db:criar -- --vazio  só o esquema
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';

const pasta = (arquivo) => fileURLToPath(new URL(`../../database/${arquivo}`, import.meta.url));

export async function criarBanco({ nome = config.banco.database, comDados = true } = {}) {
  if (!/^[A-Za-z0-9_]+$/.test(nome)) throw new Error(`Nome de banco inválido: ${nome}`);
  const { database: _ignorado, ...acesso } = config.banco;
  const conexao = await mysql.createConnection({ ...acesso, multipleStatements: true, charset: 'utf8mb4' });
  try {
    await conexao.query(`CREATE DATABASE IF NOT EXISTS \`${nome}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conexao.query(`USE \`${nome}\``);
    await conexao.query(await readFile(pasta('schema.sql'), 'utf8'));
    if (comDados) await conexao.query(await readFile(pasta('seed.sql'), 'utf8'));
  } finally {
    await conexao.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const comDados = !process.argv.includes('--vazio');
  criarBanco({ comDados })
    .then(() => console.log(`Banco "${config.banco.database}" criado${comDados ? ' com a carga inicial' : ''}.`))
    .catch((erro) => {
      console.error('Falha ao criar o banco:', erro.message);
      process.exit(1);
    });
}
