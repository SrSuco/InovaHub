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

Construir o **front-end** do InovaHub com todas as telas prototipadas, navegação real entre elas, validação de formulários e controle de acesso por perfil, ligado a uma **API em Node.js com banco MySQL**.

As telas acessam dados só pela camada de serviços. Com a variável `VITE_API_URL` definida, os serviços chamam a API; sem ela, usam dados de exemplo salvos no navegador (**modo demonstração**), para apresentar o protótipo sem instalar o banco. A modelagem está nos [diagramas UML](uml/README.md) e no [documento do banco](banco-de-dados.md).

## 2. Escopo desta fase

| Item | Incluído |
|---|---|
| Autenticação (login, erro de login, sair) com senha bcrypt e token JWT | ✅ |
| Layout base (menu lateral, barra superior, breadcrumb, rodapé) | ✅ |
| Dashboard com indicadores e gráficos | ✅ |
| **Cadastro de empresas completo** (listar, filtrar, ordenar, adicionar, editar, desativar, reativar) | ✅ |
| Ficha (detalhe) da empresa | ✅ |
| Usuários, cadastro/edição de usuário e matriz de permissões | ✅ |
| Relatórios, Configurações e Meu perfil | ✅ |
| Páginas de erro 404 e 403 | ✅ |
| Tema claro/escuro e troca da cor de destaque | ✅ |
| Layout responsivo (celular, tablet, computador) | ✅ |
| Diagramas UML (casos de uso, classes, sequência, estados, componentes) | ✅ |
| Banco MySQL (esquema, carga inicial e diagrama ER) | ✅ |
| API REST em Node.js + Express ligada às telas | ✅ |
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
| Testes | Vitest + Supertest | Mesmo ecossistema do Vite; Supertest chama a API sem subir o servidor. |
| API | Node.js 20 + Express 4 | Mesma linguagem do front-end; rotas simples e bem documentadas. |
| Banco de dados | MySQL 8 (driver mysql2) | Banco relacional pedido na disciplina; consultas com parâmetros. |
| Autenticação | bcrypt + JWT | Senha nunca guardada em texto; sessão sem estado no servidor. |
| Modo demonstração | Serviços com `localStorage` | Permitem apresentar as telas sem banco. |

### 4.1 Organização das pastas

```text
src/
├── assets/          # Logos e imagens
├── components/      # Componentes reutilizáveis (layout, formulário, tabela, modal)
├── contexts/        # Sessão do usuário, tema e avisos (toasts)
├── data/            # Dados de exemplo e matriz de permissões
├── pages/           # Uma pasta por módulo, com as telas
├── hooks/           # Hooks reutilizáveis
├── services/        # Acesso a dados: API (clienteApi.js) ou modo demonstração
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

As funções devolvem `Promise`. Cada uma verifica se a API está configurada (`usaApi`) e chama a rota correspondente; senão, usa os dados do navegador. As telas não mudam entre os dois modos.

### 4.3 API e banco de dados

```text
server/
├── scripts/criar-banco.js   # roda database/schema.sql e seed.sql
└── src/
    ├── app.js               # Express, CORS e rotas
    ├── db.js                # pool mysql2 e transações
    ├── middlewares/         # login (JWT), permissões e erros
    ├── repositorios/        # SQL de empresas, usuários e permissões
    └── rotas/               # /api/auth, /api/empresas, /api/usuarios, /api/permissoes
database/
├── schema.sql               # 18 tabelas
└── seed.sql                 # carga inicial
```

- A API confere a **matriz de permissões** do banco em cada rota, não só o menu das telas.
- A API usa as **mesmas regras de validação** das telas (`validacaoEmpresa.js`, `validacaoUsuario.js`, `validacaoSenha.js`), então a mensagem de erro é a mesma nos dois lados.
- **Não existe rota `DELETE`.** A desativação muda a situação e grava o motivo em `empresa_desativacoes`, na mesma transação.
- Rotas, variáveis de ambiente e exemplos: [`server/README.md`](../server/README.md).

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

Os campos seguem o protótipo de tela CDI-2 (`prototipos/cdi2-cadastro-empresas.md`).

| Seção | Campo | Obrigatório | Regra |
|---|---|---|---|
| Identificação | CNPJ | sim | máscara 00.000.000/0000-00, dígitos verificadores válidos, único na base, **não editável depois do cadastro** |
| | Razão social | sim | mínimo 3 caracteres |
| | Nome fantasia | não | se vazio, a listagem mostra a razão social |
| | Inscrição estadual | não | texto livre ou "Isento" |
| | Data de fundação | não | data |
| | Porte | não | MEI, Microempresa (ME), Pequeno porte (EPP), Médio porte, Grande porte |
| | Site | não | endereço completo com `http://` ou `https://` |
| Relação com o parque | Categoria | sim | Prospect, Pré-incubada, Incubada, Residente, Graduada, Parceira, Investidor, Instituição |
| | Setor | sim | Software, Saúde, Indústria 4.0, Energia, Agronegócio, Robótica, Têxtil, Educação, Fomento |
| | Responsável no parque | sim | usuário ativo da equipe |
| | Data de entrada no parque | não | data |
| Contato principal | Nome | sim | mínimo 3 caracteres |
| | Cargo | não | |
| | E-mail | sim | formato nome@dominio.tld |
| | Telefone | sim | DDD + número (10 ou 11 dígitos), máscara (47) 99999-0000 |
| Endereço | CEP | não | 8 dígitos, máscara 00000-000; o botão de busca preenche o endereço |
| | Logradouro, número, complemento, bairro | não | |
| | Cidade | sim | |
| | UF | não | sigla |
| Observações | Observações internas | não | texto longo |
| Controle (automático) | Situação | | Ativa ou Desativada |
| | Desativação | | motivo, data de saída e observação |
| | Criado em, atualizado em | | preenchidos pelo serviço |

### 6.2 Listagem (`/empresas`)

- **Cabeçalho:** título, botão **Exportar** (`empresas:P`) e botão primário **Nova empresa** (`empresas:C`).
- **Abas por situação** com contagem: **Ativas** (padrão), **Desativadas** e **Todas**.
- **Busca** em nome fantasia, razão social, contato, e-mail e CNPJ (com ou sem pontuação), sem diferenciar acentos e maiúsculas.
- **Filtros:** categoria, setor e responsável. O botão **Limpar filtros** aparece quando há algum filtro ativo.
- **Ordenação** por nome, contato, e-mail, categoria, última interação e data de cadastro, em ordem crescente ou decrescente, pelo seletor "Ordenar" ou clicando no título da coluna.
- **Paginação** de 10 itens, com "Mostrando 1–10 de N".
- **Ações por linha:** ver ficha, editar (só empresas ativas) e desativar ou reativar, conforme a permissão.
- Empresas desativadas aparecem esmaecidas e com o badge "Desativada".
- **Celular:** a tabela vira lista de cartões.
- Busca, filtros, aba, ordenação e página ficam na **URL** (`?busca=kora&ordem=email&dir=desc`), para que o link possa ser compartilhado e o botão Voltar funcione.

### 6.3 Estados vazios (padrão EmptyView)

| Situação | Mensagem | Ação |
|---|---|---|
| Nenhuma empresa cadastrada | "Nenhuma empresa cadastrada ainda" e uma frase explicando o cadastro | **Cadastrar primeira empresa** e **Importar planilha** (ou aviso para quem não pode criar) |
| Busca ou filtro sem resultado | "Nenhuma empresa encontrada" com o termo buscado | **Limpar filtros** |

### 6.4 Adicionar e editar (`/empresas/nova`, `/empresas/:id/editar`)

- Formulário em página própria, nas seções Identificação, Relação com o parque, Contato principal, Endereço e Observações, com rótulo acima de cada campo e `*` nos obrigatórios. Ao lado, o cartão "Antes de salvar" e os botões **Cadastrar empresa**/**Salvar alterações** e **Cancelar**.
- **Máscaras** em CNPJ, telefone e CEP.
- **Validação ao sair do campo** e novamente ao salvar. Cada erro aparece **abaixo do campo**, com borda vermelha e `aria-invalid`.
- Ao salvar com erros, aparece um **resumo no topo** ("Não foi possível salvar. Corrija os N campos destacados") com um link para cada campo, e o foco vai para o resumo.
- **CNPJ duplicado** é recusado pelo serviço e aparece no campo: "Este CNPJ já está cadastrado para Nexa Sensores." Se a empresa existente estiver desativada, a mensagem sugere reativá-la em vez de criar outra.
- Cancelar com alterações não salvas pede confirmação.
- Na edição, o CNPJ fica bloqueado. Empresas desativadas não podem ser editadas: a rota de edição volta para a ficha com o aviso "Reative a empresa antes de editar".

### 6.5 Desativar e reativar

- **Uma empresa nunca é excluída da base.** Não existe botão nem função de exclusão no serviço (há um teste automatizado que garante isso).
- Desativar abre um **modal de confirmação** com: **Motivo** (obrigatório: Graduou e saiu do parque, Encerrou as atividades, Desistiu do programa, Cadastro duplicado, Outro motivo), **Data de saída** (padrão: hoje) e **Observação** (opcional).
- A empresa desativada vai para a aba **Desativadas**, mantém dados e histórico e mostra na ficha a faixa "Empresa desativada em dd/mm/aaaa. Motivo: ...".
- **Reativar** fica disponível para quem tem `empresas:D` e volta a situação para Ativa.

### 6.6 Bases de consulta

| Base | Uso | No sistema real | Nesta fase |
|---|---|---|---|
| CNPJ | Botão **Buscar** ao lado do CNPJ preenche razão social, nome fantasia, porte, data de fundação e endereço | API pública da Receita, ex.: BrasilAPI `GET /api/cnpj/v1/{cnpj}` | Simulada (`consultarCnpj`); o CNPJ `11.222.333/0001-81` retorna dados de exemplo |
| CEP | Botão de busca ao lado do CEP preenche logradouro, bairro, cidade e UF | ViaCEP `GET /ws/{cep}/json/` | Simulada (`consultarCep`) para alguns CEPs de Santa Catarina |

### 6.7 Ficha da empresa (`/empresas/:id`)

- Cabeçalho com sigla, nome, badges de categoria e situação, e ações conforme o perfil (Editar, Exportar, Desativar ou Reativar).
- Abas: **Visão geral** (dados cadastrais e endereço), **Interações** (linha do tempo; as privadas só aparecem para quem tem permissão; aba bloqueada com cadeado para quem não vê interações) e **Contatos**.
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
- **Segurança:** mensagens de login genéricas; senhas com bcrypt; token JWT com validade; consultas SQL com parâmetros; permissões conferidas na API, não só no menu; usuário desativado perde o acesso na hora.

## 9. Plano de entregas (versões)

O projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/). Cada entrega gera uma *tag* e uma seção no `CHANGELOG.md`.

| Versão | Conteúdo |
|---|---|
| `v0.1.0` | Estrutura do projeto, design system, layout base, login, erros 404/403 |
| `v0.2.0` | Cadastro de empresas: listagem, filtros, ordenação, EmptyView, adicionar, editar, desativar, ficha |
| `v0.3.0` | Dashboard |
| `v0.4.0` | Usuários, permissões, relatórios, configurações e perfil |
| `v0.5.0` | Diagramas UML, banco MySQL, API em Node.js e telas ligadas à API |
| `v0.6.0` | Interações, contatos e oportunidades (as tabelas já existem) |
| `v1.0.0` | Implantação no servidor do parque |

## 10. Fora do escopo

- Telas de interações, contatos, oportunidades, eventos, programas, vínculos, tarefas e indicadores (as tabelas já estão no banco; as telas vêm a partir da v0.6.0).
- Configurações do parque gravadas no banco (hoje ficam no navegador).
- Envio real de e-mails e geração real de PDF/Excel (as ações mostram um aviso simulado).
- Chamadas reais às bases de CNPJ e CEP (as consultas são simuladas, ver 6.6).

## 11. Critérios de pronto

Uma tela só é considerada pronta quando:

1. Segue o protótipo e os padrões de tela do projeto.
2. Funciona em celular (375 px) e computador (1440 px), nos modos claro e escuro.
3. Respeita as permissões dos quatro perfis.
4. Tem as regras de negócio cobertas por testes (`npm test` passando).
5. O `npm run build` termina sem erros, e `npm test` na pasta `server` passa contra o MySQL.
6. O README e o CHANGELOG foram atualizados.
