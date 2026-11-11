# API do InovaHub

API REST do InovaHub CRM, feita com **Node.js 20+, Express 4 e MySQL 8** (ou MariaDB 10.6+). As telas em React usam esta API quando a variável `VITE_API_URL` está definida.

## Como rodar

```bash
cd server
cp .env.example .env     # ajuste usuário e senha do MySQL
npm install
npm run db:criar         # cria o banco "inovahub" com as tabelas e a carga inicial
npm run dev              # http://localhost:3333/api
```

Para conferir: `curl http://localhost:3333/api/saude` deve responder `{"status":"ok","banco":"conectado"}`.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Sobe a API e reinicia a cada alteração |
| `npm start` | Sobe a API |
| `npm run db:criar` | Recria as tabelas e a carga inicial (`-- --vazio` cria só as tabelas) |
| `npm test` | Testes unitários e de integração (usam o banco `inovahub_teste`) |

## Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORTA` | `3333` | Porta da API |
| `DB_HOST`, `DB_PORTA` | `localhost`, `3306` | Endereço do MySQL |
| `DB_USUARIO`, `DB_SENHA` | `root`, vazio | Credenciais do MySQL |
| `DB_NOME` | `inovahub` | Nome do banco |
| `DB_NOME_TESTE` | `inovahub_teste` | Banco usado pelos testes (é apagado e recriado) |
| `JWT_SEGREDO` | — | Segredo dos tokens de login. **Troque em produção.** |
| `JWT_VALIDADE`, `JWT_VALIDADE_LONGA` | `8h`, `30d` | Validade do token normal e do "manter conectado" |
| `CORS_ORIGEM` | `http://localhost:5173` | Origem do front-end liberada no CORS |

## Rotas

Todas as rotas começam com `/api`. Fora `saude` e `auth/login`, todas pedem o cabeçalho `Authorization: Bearer <token>`. Erros voltam como `{ "mensagem": "...", "campos": { "campo": "mensagem" } }`.

| Método | Rota | Permissão | Descrição |
| --- | --- | --- | --- |
| GET | `/saude` | pública | Verifica a API e a conexão com o banco |
| POST | `/auth/login` | pública | `{ identificador, senha, manterConectado }` → `{ token, usuario, matriz }` |
| GET | `/auth/sessao` | logado | Usuário e matriz atualizados a partir do token |
| PUT | `/auth/perfil` | logado | Nome, cargo e telefone do próprio usuário |
| PUT | `/auth/senha` | logado | `{ atual, nova, confirmacao }` |
| GET | `/empresas` | empresas · V | Todas as empresas, ativas e desativadas |
| GET | `/empresas/:id` | empresas · V | Uma empresa |
| POST | `/empresas` | empresas · C | Cadastra (CNPJ válido e único) |
| PUT | `/empresas/:id` | empresas · E | Edita (o CNPJ não muda; desativada não edita) |
| POST | `/empresas/:id/desativar` | empresas · D | `{ motivo, dataSaida, observacao }` |
| POST | `/empresas/:id/reativar` | empresas · D | Volta para Ativa e fecha o registro de desativação |
| GET | `/usuarios/responsaveis` | logado | Equipe ativa, para o campo "Responsável no parque" |
| GET | `/usuarios` | usuarios · V | Todos os usuários |
| GET | `/usuarios/:id` | usuarios · V | Um usuário |
| POST | `/usuarios` | usuarios · C | Cria por convite ou com senha temporária |
| PUT | `/usuarios/:id` | usuarios · E | Edita |
| PATCH | `/usuarios/:id/situacao` | usuarios · D | `{ situacao: "Ativo" \| "Convite pendente" \| "Desativado" }` |
| GET | `/permissoes` | logado | Matriz `{ perfil: { modulo: "VCEDP" } }` |
| PUT | `/permissoes` | permissoes · E | Grava a matriz (o Administrador mantém acesso total) |

**Não existe `DELETE`.** Empresas são desativadas e usuários mudam de situação, como pede o escopo.

## Organização

```
server/
├── scripts/criar-banco.js     cria o banco e roda database/schema.sql e seed.sql
├── src/
│   ├── index.js               sobe o servidor depois de testar a conexão
│   ├── app.js                 Express, CORS e rotas
│   ├── config.js              lê o .env
│   ├── db.js                  pool mysql2, consultas e transações
│   ├── validacao.js           reaproveita as regras de validação das telas
│   ├── middlewares/           autenticação (JWT), permissões e erros
│   ├── repositorios/          SQL de empresas, usuários e permissões
│   ├── rotas/                 auth, empresas, usuarios, permissoes
│   └── utils/                 formatação de CNPJ e datas
└── test/                      testes com Vitest e Supertest
```

## Segurança

- Senhas guardadas com **bcrypt**; a API nunca devolve o hash.
- Todas as consultas usam **parâmetros** (`?`), sem concatenar valores no SQL.
- O usuário é relido do banco a cada requisição: quem é desativado ou muda de perfil perde o acesso na hora.
- Em produção, crie um usuário MySQL só com `SELECT`, `INSERT` e `UPDATE` no banco `inovahub`.
