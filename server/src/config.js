import 'dotenv/config';

/** Configuração lida do arquivo .env (veja .env.example). */
export const config = {
  porta: Number(process.env.PORTA ?? 3333),
  banco: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORTA ?? 3306),
    user: process.env.DB_USUARIO ?? 'root',
    password: process.env.DB_SENHA ?? '',
    database: process.env.DB_NOME ?? 'inovahub',
  },
  jwt: {
    segredo: process.env.JWT_SEGREDO ?? 'segredo-de-desenvolvimento',
    validade: process.env.JWT_VALIDADE ?? '8h',
    validadeLonga: process.env.JWT_VALIDADE_LONGA ?? '30d',
  },
  corsOrigem: process.env.CORS_ORIGEM || true,
};
