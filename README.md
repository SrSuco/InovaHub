<p align="center">
  <img src="src/assets/inovaparq-logo.png" alt="Logo InovaParq" height="56" />
  &nbsp;&nbsp;&nbsp;
  <img src="src/assets/logo-univille.png" alt="Logo UNIVILLE" height="56" />
</p>

<h1 align="center">InovaHub</h1>

<p align="center">
  CRM para o relacionamento entre o <strong>InovaParq</strong> (Parque de Inovação da UNIVILLE) e as empresas do seu ecossistema.
</p>

<p align="center">
  <img alt="Versão" src="https://img.shields.io/badge/vers%C3%A3o-0.3.0-AB218E" />
  <img alt="Etapa" src="https://img.shields.io/badge/etapa-CDI--2-00703C" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind%20%2B%20DaisyUI-3%20%2F%204-38BDF8" />
</p>

---

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Telas implementadas](#telas-implementadas)
3. [Tecnologias](#tecnologias)
4. [Como rodar](#como-rodar)
5. [Cadastro de empresas](#cadastro-de-empresas)
6. [Usuários de demonstração](#usuários-de-demonstração)
7. [Estrutura de pastas](#estrutura-de-pastas)
8. [Documentação](#documentação)
9. [Roadmap](#roadmap)
10. [Como contribuir](#como-contribuir)
11. [Créditos](#créditos)

---

## Sobre o projeto

O **InovaHub** é um sistema de **CRM** (*Customer Relationship Management*) feito sob medida para o **InovaParq**, o parque de inovação da **UNIVILLE**, em Joinville/SC. Ele reúne em um só lugar as empresas residentes, incubadas, parceiras e prospects, os contatos e as interações da equipe do parque, com indicadores para apoiar decisões.

Esta é a etapa **CDI-2**: a implementação do front-end a partir dos protótipos de tela. Os dados ficam em uma camada de serviço simulada no navegador, pronta para ser trocada pela API quando o back-end for definido. O escopo completo está em [`docs/ESCOPO.md`](docs/ESCOPO.md).

## Telas implementadas

| Tela | Rota | Situação |
|---|---|---|
| Login (e login com erro) | `/login` | ✅ |
| Dashboard (indicadores e gráficos) | `/` | ✅ |
| Erro 404 | qualquer rota inexistente | ✅ |
| Acesso não autorizado (403) | `/acesso-negado` | ✅ |
| Listagem de empresas (filtros, ordenação, EmptyView) | `/empresas` | ✅ |
| Adicionar empresa (e com erros) | `/empresas/nova` | ✅ |
| Editar empresa (e com erros) | `/empresas/:id/editar` | ✅ |
| Desativar e reativar empresa | ações da listagem e da ficha | ✅ |
| Ficha da empresa | `/empresas/:id` | ✅ |
| Usuários e permissões | `/usuarios`, `/permissoes` | ⚪ |
| Relatórios, Configurações e Meu perfil | `/relatorios`, `/configuracoes`, `/perfil` | ⚪ |

Legenda: ✅ pronta · 🟡 em andamento · ⚪ a fazer

## Tecnologias

| Item | Escolha |
|---|---|
| Interface | [React 18](https://react.dev/) |
| Build e servidor local | [Vite](https://vitejs.dev/) |
| Rotas | [React Router 6](https://reactrouter.com/) |
| Estilo e componentes | [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) |
| Gráficos | [Chart.js](https://www.chartjs.org/) |
| Testes | [Vitest](https://vitest.dev/) |

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org/) 20 ou mais recente.

```bash
git clone https://github.com/SrSuco/inovahub.git
cd inovahub
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm test` | Roda os testes automatizados |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção localmente |

## Cadastro de empresas

Implementa o pedido da etapa CDI-2 para o cadastro de empresas:

- **Listagem** com abas Ativas, Desativadas e Todas, busca por nome, CNPJ, contato ou e-mail, filtros por categoria, setor e responsável, e ordenação por nome, contato, e-mail, categoria, última interação ou data de cadastro.
- **EmptyView** quando não há empresas cadastradas e quando a busca não encontra nada.
- **Adicionar e editar** com validação campo a campo e resumo de erros no topo. O CNPJ não pode repetir nem ser alterado depois do cadastro.
- **Desativar** no lugar de excluir: a empresa sai das ativas, mas mantém os dados e o histórico, e pode ser reativada.

As regras completas estão na [seção 6 do escopo](docs/ESCOPO.md#6-módulo-cadastro-de-empresas).

> Dica: para ver a tela vazia, rode `localStorage.setItem('inovahub:empresas', '[]')` no console do navegador e recarregue. Para voltar aos dados de exemplo, rode `localStorage.removeItem('inovahub:empresas')`.

## Usuários de demonstração

Todos usam a senha **`inovahub`**.

| Usuário | Perfil | O que pode fazer |
|---|---|---|
| `admin` | Administrador | Tudo, inclusive usuários, permissões e desativação de empresas |
| `gerencia` | Gerência | Vê e edita tudo e desativa empresas; não gerencia usuários |
| `analista` | Analista | Cria e edita empresas e interações |
| `consulta` | Consulta | Somente leitura |

## Estrutura de pastas

```text
inovahub/
├── docs/
│   └── ESCOPO.md          # Escopo do projeto para codificação
├── public/                # Arquivos servidos como estão (favicon)
├── src/
│   ├── assets/            # Logos institucionais
│   ├── components/        # Componentes reutilizáveis e layout
│   ├── contexts/          # Sessão, tema e avisos
│   ├── data/              # Dados de exemplo e permissões
│   ├── pages/             # Telas, agrupadas por módulo
│   ├── services/          # Acesso a dados (simulado)
│   ├── utils/             # Funções auxiliares
│   ├── App.jsx            # Rotas
│   └── main.jsx           # Ponto de entrada
├── CHANGELOG.md           # Histórico de versões
├── CONTRIBUTING.md        # Fluxo de branches, commits e versões
└── README.md
```

## Documentação

- [Escopo do projeto (CDI-2)](docs/ESCOPO.md)
- [Guia de contribuição](CONTRIBUTING.md)
- [Histórico de versões](CHANGELOG.md)

## Roadmap

| Versão | Conteúdo | Situação |
|---|---|---|
| `v0.1.0` | Estrutura, design system, layout, login, erros 404/403 | ✅ |
| `v0.2.0` | Cadastro de empresas | ✅ |
| `v0.3.0` | Dashboard | ✅ |
| `v0.4.0` | Usuários, permissões, relatórios, configurações e perfil | ⚪ |
| `v1.0.0` | Integração com o back-end | ⚪ |

## Como contribuir

Leia o [guia de contribuição](CONTRIBUTING.md). Em resumo: crie uma branch a partir da `develop`, faça commits pequenos no padrão `tipo: descrição`, rode `npm test` e `npm run build`, e abra um pull request.

## Créditos

Projeto desenvolvido no contexto de estágio junto ao **InovaParq, Parque de Inovação da UNIVILLE**, Joinville/SC.

- **Desenvolvimento:** Gabriel Nasário
- **Instituições:** InovaParq · UNIVILLE
