# Componentes e implantação

O InovaHub tem três partes: o front-end em React, a API em Node.js com Express e o banco MySQL. Em desenvolvimento, o Vite repassa as chamadas `/api` para a API, então o navegador enxerga tudo na mesma origem.

```mermaid
flowchart LR
  subgraph navegador["Navegador"]
    direction TB
    telas["Telas (pages/)"]
    contextos["Contextos<br/>Sessão · Tema · Avisos"]
    servicos["Serviços<br/>empresasService · usuariosService · permissoesService"]
    cliente["clienteApi<br/>fetch + token JWT"]
    local[("localStorage<br/>modo demonstração")]
    telas --> contextos
    telas --> servicos
    contextos --> servicos
    servicos --> cliente
    servicos -. "sem VITE_API_URL" .-> local
  end

  subgraph servidor["Servidor Node.js (server/)"]
    direction TB
    app["app.js<br/>Express, CORS, JSON"]
    mw["middlewares<br/>autenticação · permissão · erros"]
    rotas["rotas<br/>auth · empresas · usuarios · permissoes"]
    repos["repositórios<br/>SQL parametrizado"]
    validacao["validação<br/>mesmas regras das telas"]
    pool["pool mysql2"]
    app --> mw --> rotas
    rotas --> validacao
    rotas --> repos --> pool
  end

  subgraph banco["MySQL 8"]
    db[("inovahub")]
  end

  cliente -- "HTTPS /api/*" --> app
  pool -- "TCP 3306" --> db
```

## Modo demonstração e modo API

| | Modo demonstração | Modo API |
| --- | --- | --- |
| Quando | `VITE_API_URL` vazio | `VITE_API_URL=/api` (ou a URL da API) |
| Dados | `localStorage` do navegador | Banco MySQL |
| Login | Senha fixa `inovahub` | Hash bcrypt + token JWT |
| Uso | Apresentar o protótipo sem instalar nada | Desenvolvimento e produção |

As telas são as mesmas nos dois modos. Só o corpo das funções em `src/services/` muda.
