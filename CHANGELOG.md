# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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

[0.2.0]: https://github.com/SrSuco/inovahub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/SrSuco/inovahub/releases/tag/v0.1.0
