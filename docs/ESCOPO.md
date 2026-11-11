# Escopo do projeto InovaHub · CDI-2

> **Projeto:** InovaHub, CRM do InovaParq (Parque de Inovação da UNIVILLE)
> **Etapa:** CDI-2, preparação para codificação
> **Base:** protótipos de tela do CDI-1, levantamento de padrões de tela e identidade visual do projeto

Este documento define **o que será codificado**, **como** e **em que ordem**. Ele transforma os protótipos em requisitos verificáveis, para que cada tela implementada possa ser conferida contra uma lista objetiva de critérios.

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Escopo desta fase](#2-escopo-desta-fase)
3. [Perfis de acesso](#3-perfis-de-acesso)
4. [Arquitetura e tecnologias](#4-arquitetura-e-tecnologias)
5. [Mapa de telas e rotas](#5-mapa-de-telas-e-rotas)
6. [Módulo Cadastro de Empresas](#6-módulo-cadastro-de-empresas)
7. [Demais telas](#7-demais-telas)
8. [Requisitos não funcionais](#8-requisitos-não-funcionais)
9. [Plano de entregas (versões)](#9-plano-de-entregas-versões)
10. [Fora do escopo](#10-fora-do-escopo)
11. [Critérios de pronto](#11-critérios-de-pronto)

---

## 1. Objetivo

Construir o **front-end** do InovaHub com todas as telas prototipadas, navegação real entre elas, validação de formulários e controle de acesso por perfil. Os dados ficam em uma **camada de serviço simulada** (dados de exemplo salvos no navegador), com a mesma forma de chamada que a API real terá. Assim, quando o back-end for definido, basta trocar a implementação dos serviços, sem refazer as telas.

## 2. Escopo desta fase

| Item | Incluído |
|---|---|
| Autenticação simulada (login, erro de login, sair) | ✅ |
| Layout base (menu lateral, barra superior, breadcrumb, rodapé) | ✅ |
| Dashboard com indicadores e gráficos | ✅ |
| **Cadastro de empresas completo** (listar, filtrar, ordenar, adicionar, editar, desativar, reativar) | ✅ |
| Ficha (detalhe) da empresa | ✅ |
| Usuários, cadastro/edição de usuário e matriz de permissões | ✅ |
| Relatórios, Configurações e Meu perfil | ✅ |
| Páginas de erro 404 e 403 | ✅ |
| Tema claro/escuro e troca da cor de destaque | ✅ |
| Layout responsivo (celular, tablet, computador) | ✅ |
| Testes automatizados das regras de negócio (validações, filtros, permissões) | ✅ |

## 3. Perfis de acesso

| Perfil | Resumo |
|---|---|
| **Administrador** | Acesso total, inclusive usuários, permissões e desativação de empresas. |
| **Gerência** | Vê e edita tudo, vê interações privadas, desativa empresas. Não gerencia usuários. |
| **Analista** | Cria e edita empresas, contatos, oportunidades, interações e eventos. |
| **Consulta** | Somente leitura das empresas atribuídas, eventos e relatórios (professores e avaliadores). |

As permissões são uma matriz **módulo × ação**, com as ações `V` (ver), `C` (criar), `E` (editar), `D` (desativar) e `P` (exportar). A matriz padrão fica em `src/data/permissoes.js` e pode ser alterada na tela **Permissões** pelo Administrador.

| Módulo | Administrador | Gerência | Analista | Consulta |
|---|---|---|---|---|
| Dashboard | V | V | V | V |
| Empresas | V C E D P | V C E D P | V C E | V |
| Interações | V C E D | V C E | V C E | — |
| Interações privadas | V C E | V C E | — | — |
| Relatórios | V P | V P | V P | V |
| Usuários | V C E D | — | — | — |
| Permissões | V E | — | — | — |
| Configurações | V E | V E | — | — |

## 4. Arquitetura e tecnologias

| Camada | Escolha | Motivo |
|---|---|---|
| Linguagem | JavaScript (ES2022) | Simples de ler e manter na disciplina. |
| Framework de UI | React 18 | Componentes reutilizáveis para o layout e os formulários. |
| Build e servidor local | Vite | Início rápido e recarga instantânea. |
| Rotas | React Router 6 | Uma URL por tela, com rotas protegidas por perfil. |
| Estilo | Tailwind CSS 3 + DaisyUI 4 | Mesmo design system dos protótipos; temas trocáveis. |
| Gráficos | Chart.js 4 (react-chartjs-2) | Barras, linhas e rosca do dashboard. |
| Testes | Vitest | Mesmo ecossistema do Vite, sem configuração extra. |
| Dados | Serviços simulados com `localStorage` | Permitem testar o fluxo completo sem back-end. |

### 4.1 Organização das pastas

```text
src/
├── assets/          # Logos e imagens
├── components/      # Componentes reutilizáveis (layout, formulário, tabela, modal)
├── contexts/        # Sessão do usuário, tema e avisos (toasts)
├── data/            # Dados de exemplo e matriz de permissões
├── pages/           # Uma pasta por módulo, com as telas
├── services/        # Acesso a dados (hoje simulado, amanhã a API)
├── utils/           # Validações, máscaras, ordenação e formatação
├── App.jsx          # Definição das rotas
└── main.jsx         # Ponto de entrada
```

### 4.2 Camada de serviço

Toda tela acessa dados por funções assíncronas de `src/services/`, por exemplo:

```js
listarEmpresas({ busca, categoria, setor, situacao, ordenarPor, direcao, pagina })
obterEmpresa(id)
criarEmpresa(dados)          // valida e rejeita CNPJ duplicado
atualizarEmpresa(id, dados)
desativarEmpresa(id, motivo) // nunca exclui
reativarEmpresa(id)
```

As funções devolvem `Promise`, simulando a latência de rede. Na integração com o back-end, só o corpo dessas funções muda.

## 5. Mapa de telas e rotas

| Rota | Tela | Permissão exigida |
|---|---|---|
| `/login` | Login (e variação com erro) | pública |
| `/` | Dashboard | `dashboard:V` |
| `/empresas` | Listagem de empresas (e EmptyView) | `empresas:V` |
| `/empresas/nova` | Adicionar empresa (e variação com erros) | `empresas:C` |
| `/empresas/:id` | Ficha da empresa | `empresas:V` |
| `/empresas/:id/editar` | Editar empresa (e variação com erros) | `empresas:E` |
| `/usuarios` | Usuários | `usuarios:V` |
| `/usuarios/novo` | Novo usuário | `usuarios:C` |
| `/usuarios/:id/editar` | Editar usuário | `usuarios:E` |
| `/permissoes` | Controle de permissões | `permissoes:V` |
| `/relatorios` | Relatórios | `relatorios:V` |
| `/configuracoes` | Configurações | `configuracoes:V` |
| `/perfil` | Meu perfil | autenticado |
| `/acesso-negado` | Acesso não autorizado (403) | pública |
| `*` | Página não encontrada (404) | pública |

Regras de navegação:

- Quem não está logado e abre uma rota protegida vai para `/login` e, depois de entrar, volta para a rota pedida.
- Quem está logado sem permissão para a rota vê `/acesso-negado`.
- Itens do menu e botões de ação só aparecem quando o perfil tem a permissão correspondente.

## 6. Módulo Cadastro de Empresas

Requisito do orientador: protótipo e implementação do cadastro de empresas com os campos mais comuns, listagem com filtros e ordenação, EmptyView, adicionar e editar com mensagens de erro, e desativação no lugar da exclusão.

### 6.1 Campos

| Seção | Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| Dados gerais | Razão social | texto | sim | 3 a 120 caracteres |
| | Nome fantasia | texto | sim | 2 a 60 caracteres |
| | CNPJ | texto com máscara | sim | 14 dígitos, dígitos verificadores válidos, único na base |
| | Inscrição estadual | texto | não | até 20 caracteres, ou "Isento" |
| | Data de fundação | data | não | não pode ser futura |
| | Porte | seleção | sim | MEI, ME, EPP, Média, Grande |
| | Setor | seleção | sim | lista de setores do parque |
| | Categoria no parque | seleção | sim | Prospect, Pré-incubada, Incubada, Residente, Graduada, Parceira, Instituição |
| | Site | URL | não | começa com `http://` ou `https://` |
| Contato principal | Nome do contato | texto | sim | 3 a 80 caracteres |
| | Cargo | texto | não | até 60 caracteres |
| | E-mail | e-mail | sim | formato válido |
| | Telefone | texto com máscara | sim | 10 ou 11 dígitos com DDD |
| Endereço | CEP | texto com máscara | sim | 8 dígitos |
| | Logradouro | texto | sim | |
| | Número | texto | sim | número ou "S/N" |
| | Complemento | texto | não | |
| | Bairro | texto | sim | |
| | Cidade | texto | sim | |
| | UF | seleção | sim | sigla válida |
| Relacionamento | Responsável no parque | seleção | sim | usuário ativo da equipe |
| | Data de entrada no parque | data | não | não pode ser futura |
| | Observações | texto longo | não | até 500 caracteres |
| Controle (automático) | Situação | Ativa / Inativa | | definida pelo sistema |
| | Motivo e data da desativação | | | preenchidos ao desativar |
| | Criado em, atualizado em | data e hora | | preenchidos pelo serviço |

### 6.2 Listagem (`/empresas`)

- **Cabeçalho:** título, total de empresas e botão primário **Nova empresa** (perfis com `empresas:C`).
- **Busca** por nome fantasia, razão social, CNPJ, contato ou e-mail.
- **Filtros:** categoria, setor, cidade e situação (Ativas, Inativas, Todas). O padrão é **Ativas**. Cada filtro aplicado aparece como *chip* removível, e há o botão **Limpar filtros**.
- **Ordenação** por nome, contato, e-mail, categoria, cidade e data de cadastro, em ordem crescente ou decrescente. Funciona clicando no cabeçalho da coluna ou pelo seletor "Ordenar por" (no celular).
- **Paginação** de 10 itens, com "Mostrando 1–10 de N".
- **Ações por linha** no menu "⋯": Abrir ficha, Editar, Desativar (ou Reativar quando inativa).
- Empresas **inativas** aparecem esmaecidas e com badge "Inativa".
- **Celular:** a tabela vira lista de cartões.
- O estado de busca, filtros, ordenação e página fica na **URL** (`?busca=&ordem=nome&dir=asc`), para que o link possa ser compartilhado e o botão Voltar funcione.

### 6.3 Estados vazios (padrão EmptyView)

| Situação | Mensagem | Ação |
|---|---|---|
| Nenhuma empresa cadastrada | "Nenhuma empresa cadastrada ainda" e uma frase explicando o que é o cadastro | **Cadastrar a primeira empresa** (ou aviso para quem não pode criar) |
| Busca ou filtro sem resultado | "Nenhuma empresa encontrada para estes filtros" | **Limpar filtros** |

### 6.4 Adicionar e editar (`/empresas/nova`, `/empresas/:id/editar`)

- Formulário em página própria, dividido nas seções da tabela 6.1, com rótulo acima de cada campo e `*` nos obrigatórios.
- **Máscaras** em CNPJ, telefone e CEP.
- **Validação ao sair do campo** e novamente ao salvar. Cada erro aparece **abaixo do campo**, com borda vermelha e `aria-invalid`.
- Ao salvar com erros, aparece um **resumo no topo** ("Corrija os 3 campos destacados para continuar") com links para cada campo, e o foco vai para o primeiro campo com erro.
- **Erros de negócio** vindos do serviço (por exemplo, "Já existe uma empresa com este CNPJ") aparecem no campo correspondente.
- Botões **Salvar** (primário) e **Cancelar**. Cancelar com alterações não salvas pede confirmação.
- Sucesso: aviso "Empresa cadastrada com sucesso" (ou "Alterações salvas") e retorno à ficha da empresa.
- Na edição, o CNPJ pode ser corrigido, mas continua sujeito à regra de unicidade. Empresas inativas abrem em modo leitura, com o botão Reativar.

### 6.5 Desativar e reativar

- **Uma empresa nunca é excluída da base.** Não existe botão nem função de exclusão.
- Desativar abre um **modal de confirmação** com o nome da empresa, as consequências e o campo **Motivo** (obrigatório, de 10 a 300 caracteres).
- Após desativar, a empresa sai da lista padrão (filtro "Ativas"), mantém todo o histórico e mostra na ficha a faixa "Empresa inativa desde dd/mm/aaaa · Motivo".
- **Reativar** está disponível para quem tem `empresas:D` e volta a situação para Ativa.

### 6.6 Ficha da empresa (`/empresas/:id`)

- Cabeçalho com sigla, nome fantasia, badges de categoria e situação, e ações conforme o perfil (Editar, Desativar/Reativar, Exportar).
- Abas: **Visão geral** (dados cadastrais, contato e endereço), **Interações** (linha do tempo; privadas só para quem tem permissão) e **Contatos**.
- Cartão lateral "Seu acesso a esta empresa", com o que o perfil pode fazer.

## 7. Demais telas

| Tela | O que implementar |
|---|---|
| Login | Usuário ou e-mail, senha com botão mostrar, "Manter conectado", mensagem genérica de erro, campos em vermelho e usuário digitado mantido. |
| Dashboard | Quatro indicadores, gráfico de linhas (interações por mês), rosca (empresas por categoria), barras (empresas por setor), lista "Sem acompanhamento" e atalho Nova empresa. |
| Usuários | Totais por situação, busca, filtros por perfil e situação, ações (editar, desativar, reativar). |
| Novo/Editar usuário | Dados pessoais, perfil com descrição, resumo das permissões do perfil escolhido e validação. |
| Permissões | Abas por perfil e matriz módulo × ação; Administrador sempre com acesso total; restaurar padrão. |
| Relatórios | Filtros de período e lista de relatórios disponíveis com prévia e exportação simulada. |
| Configurações | Dados do parque, aparência (modo claro/escuro e cor de destaque). |
| Meu perfil | Dados pessoais, troca de senha com validação e cartão "Meu acesso". |
| 404 e 403 | Mensagem amigável, ilustração simples, botões Voltar e Ir para o início (ou Ir para o login). |

## 8. Requisitos não funcionais

- **Acessibilidade (WCAG 2.1 AA):** contraste mínimo 4,5:1, foco visível, rótulos ligados aos campos, mensagens de erro anunciadas (`role="alert"`), navegação por teclado em menus e modais.
- **Responsividade:** sem rolagem horizontal a partir de 360 px de largura; menu lateral vira gaveta abaixo de 1024 px.
- **Desempenho:** primeira carga abaixo de 300 KB compactados; telas carregadas sob demanda.
- **Idioma:** toda a interface em português do Brasil; datas no formato dd/mm/aaaa.
- **Segurança (preparação):** mensagens de login genéricas; nenhuma senha guardada em texto no navegador; permissões conferidas também na rota, não só no menu.

## 9. Plano de entregas (versões)

O projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/). Cada entrega gera uma *tag* e uma seção no `CHANGELOG.md`.

| Versão | Conteúdo |
|---|---|
| `v0.1.0` | Estrutura do projeto, design system, layout base, login, erros 404/403 |
| `v0.2.0` | Dashboard |
| `v0.3.0` | Cadastro de empresas: listagem, filtros, ordenação, EmptyView, adicionar, editar, desativar, ficha |
| `v0.4.0` | Usuários, permissões, relatórios, configurações e perfil |
| `v1.0.0` | Integração com o back-end (a definir) |

## 10. Fora do escopo

- Back-end, banco de dados e autenticação real (próxima etapa).
- Módulos Contatos, Oportunidades e Eventos como telas próprias (aparecem no menu como "em breve").
- Envio real de e-mails e geração real de PDF/Excel (as ações mostram um aviso simulado).
- Busca de endereço por CEP em serviço externo.

## 11. Critérios de pronto

Uma tela só é considerada pronta quando:

1. Segue o protótipo e os padrões de tela do projeto.
2. Funciona em celular (375 px) e computador (1440 px), nos modos claro e escuro.
3. Respeita as permissões dos quatro perfis.
4. Tem as regras de negócio cobertas por testes (`npm test` passando).
5. O `npm run build` termina sem erros.
6. O README e o CHANGELOG foram atualizados.
