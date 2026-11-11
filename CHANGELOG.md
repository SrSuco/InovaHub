# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.5.0] - 2026-11-11

### Adicionado

- Diagramas UML em `docs/uml/`: casos de uso, classes (domínio e aplicação), sequência (login, cadastro e desativação), estados e componentes, com cópias em SVG.
- Esquema do banco MySQL em `database/schema.sql`, com 18 tabelas, chaves estrangeiras, índices, restrições e a visão `vw_empresas`.
- Carga inicial em `database/seed.sql` com os perfis, a matriz de permissões, os usuários e as empresas do protótipo.
- Documentação do banco com diagrama entidade-relacionamento em `docs/banco-de-dados.md`.
- API em Node.js com Express e mysql2 (`server/`): login com bcrypt e token JWT, rotas de empresas, usuários e permissões, e script `npm run db:criar`.
- Testes de integração da API contra o MySQL.
- Cliente HTTP nas telas: com `VITE_API_URL` definida, os dados vêm da API; sem ela, as telas continuam no modo demonstração.
- Troca de senha e edição do próprio perfil gravadas no banco.

### Alterado

- O responsável no parque passa a ser carregado de forma assíncrona nas telas de empresas.
- As regras de senha saíram da tela Meu perfil para um módulo próprio, usado também pela API.

### Corrigido

- Erros de permissão, de validação e de conexão devolvidos pela API aparecem nas telas.

## [0.4.0] - 2026-11-11

### Adicionado

- Lista de usuários com totais por situação, busca, filtros por perfil e situação e ações de editar, redefinir senha, reenviar convite, desativar e reativar acesso.
- Cadastro e edição de usuário com escolha do perfil, resumo do que o perfil pode fazer e opção de convite ou senha temporária.
- Matriz de permissões por perfil, com aviso de alterações não salvas e opção de restaurar o padrão.
- Relatórios de empresas por categoria, setor e cidade, com prévia e exportação.
- Configurações do parque e da aparência (modo claro/escuro e cor de destaque).
- Meu perfil com dados pessoais, troca de senha e resumo de acesso.
- Capturas das telas no README.

### Corrigido

- E-mails longos no menu do usuário não causam mais rolagem lateral.

## [0.3.0] - 2026-11-11

### Adicionado

- Dashboard com indicadores de empresas ativas, incubadas, parceiros e empresas sem acompanhamento.
- Gráficos de linhas (interações por mês), rosca (empresas por categoria) e barras (empresas por setor), que seguem o modo claro/escuro e a cor de destaque.
- Lista de empresas sem interação há mais de 30 dias e lista de tarefas.

## [0.2.0] - 2026-11-11

### Adicionado

- Listagem de empresas com abas Ativas, Desativadas e Todas, busca por nome, CNPJ, contato ou e-mail, filtros por categoria, setor e responsável, ordenação crescente e decrescente e paginação.
- Estado vazio (EmptyView) para base sem empresas e para busca sem resultado.
- Cadastro e edição de empresas com máscaras, validação ao sair do campo, resumo de erros no topo e confirmação ao descartar alterações.
- Bloqueio de CNPJ duplicado e de alteração do CNPJ depois do cadastro.
- Desativação de empresa com motivo, data de saída e observação, e reativação. Empresas nunca são excluídas.
- Ficha da empresa com abas Visão geral, Interações e Contatos e ações conforme o perfil.
- Consultas simuladas de CNPJ e CEP para preencher o formulário.
- Testes das validações, máscaras, filtros, ordenação e regras do serviço de empresas.

### Corrigido

- Badges de categoria não quebram mais em duas linhas.
- Formulários sem rolagem lateral no celular.

## [0.1.0] - 2026-11-11

### Adicionado

- Escopo do projeto para a etapa CDI-2 (`docs/ESCOPO.md`).
- Projeto React + Vite com Tailwind CSS e DaisyUI.
- Temas claro e escuro do InovaHub e troca da cor de destaque.
- Logo, favicon e biblioteca de ícones.
- Perfis de acesso (Administrador, Gerência, Analista e Consulta) e matriz de permissões.
- Moldura das telas internas: menu lateral, barra superior, breadcrumb e rodapé.
- Rotas protegidas por sessão e por permissão.
- Tela de login com mensagem de erro genérica e opção "Manter conectado".
- Páginas de erro 404 e de acesso não autorizado (403).
- Guia de contribuição e modelo de pull request.

[0.5.0]: https://github.com/SrSuco/inovahub/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/SrSuco/inovahub/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/SrSuco/inovahub/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/SrSuco/inovahub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/SrSuco/inovahub/releases/tag/v0.1.0
