import { criarApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    console.log(`Conectado ao MySQL em ${config.banco.host}:${config.banco.port}/${config.banco.database}`);
  } catch (erro) {
    console.error(`Não foi possível conectar ao MySQL (${erro.code ?? erro.message}).`);
    console.error('Confira o arquivo .env e se o banco foi criado com "npm run db:criar".');
    process.exit(1);
  }
  criarApp().listen(config.porta, () => {
    console.log(`API do InovaHub em http://localhost:${config.porta}/api`);
  });
}

iniciar();
