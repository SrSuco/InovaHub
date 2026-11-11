# Guia de contribuição

Este guia descreve como o código do InovaHub é organizado no Git: branches, commits, *merges* e versões. Seguir essas regras mantém o histórico limpo e fácil de revisar.

## Branches

O projeto usa um fluxo inspirado no **Git Flow**:

| Branch | Para que serve | Recebe *merge* de |
|---|---|---|
| `main` | Código das versões publicadas. Cada *merge* aqui gera uma tag. | `release/*`, `hotfix/*` |
| `develop` | Integração do que está pronto para a próxima versão. | `feature/*`, `fix/*`, `docs/*` |
| `feature/<nome>` | Uma funcionalidade nova (ex.: `feature/cadastro-empresas`). | — |
| `fix/<nome>` | Correção de algo que ainda não foi publicado. | — |
| `docs/<nome>` | Apenas documentação. | — |
| `release/<versão>` | Preparação de uma versão (número, CHANGELOG). | — |
| `hotfix/<nome>` | Correção urgente em produção, criada a partir da `main`. | — |

Nunca faça commit direto na `main` ou na `develop`.

## Passo a passo de uma funcionalidade

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-funcionalidade

# ... desenvolva em commits pequenos ...

npm test
npm run build
git push -u origin feature/nome-da-funcionalidade
```

Depois abra um **Pull Request** para a `develop`, revise e faça o *merge* **sem fast-forward** (`git merge --no-ff`), para que o histórico mostre onde cada funcionalidade começou e terminou. Apague a branch depois do *merge*.

## Mensagens de commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), em português e no presente:

```text
<tipo>: <o que o commit faz>
```

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova | `feat: adiciona filtro por setor na lista de empresas` |
| `fix` | Correção de erro | `fix: corrige validação do CNPJ com zeros à esquerda` |
| `docs` | Documentação | `docs: atualiza o README com as novas telas` |
| `style` | Visual ou formatação, sem mudar comportamento | `style: ajusta espaçamento dos cartões do dashboard` |
| `refactor` | Melhoria interna sem mudar comportamento | `refactor: extrai componente de campo de formulário` |
| `test` | Testes | `test: cobre a ordenação da lista de empresas` |
| `chore` | Configuração, dependências, build | `chore: atualiza o Vite` |

Regras práticas:

- **Um assunto por commit.** Se a mensagem precisa de "e", provavelmente são dois commits.
- Commits **pequenos**: fáceis de revisar e de desfazer.
- O título tem no máximo 72 caracteres. Se precisar explicar o porquê, use o corpo da mensagem.

## Versionamento

O projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/) (`MAIOR.MENOR.CORREÇÃO`):

- **MAIOR**: mudança que quebra compatibilidade (ex.: troca da API).
- **MENOR**: funcionalidade nova compatível (ex.: nova tela).
- **CORREÇÃO**: correção de erro.

Enquanto o projeto estiver em `0.x`, cada conjunto de telas entregue aumenta o número MENOR.

### Como publicar uma versão

```bash
git checkout develop
git checkout -b release/0.3.0
npm version 0.3.0 --no-git-tag-version   # atualiza o package.json
# atualize o CHANGELOG.md e o README.md
git commit -am "chore: prepara a versão 0.3.0"
git checkout main
git merge --no-ff release/0.3.0 -m "Merge branch 'release/0.3.0'"
git tag -a v0.3.0 -m "Versão 0.3.0"
git checkout develop
git merge --no-ff release/0.3.0 -m "Merge branch 'release/0.3.0' into develop"
git branch -d release/0.3.0
git push origin main develop --tags
```

Todo o histórico de versões fica no [CHANGELOG.md](CHANGELOG.md).

## Antes de abrir um Pull Request

- [ ] `npm test` passa.
- [ ] `npm run build` termina sem erros.
- [ ] A tela funciona no celular (375 px) e no computador, nos modos claro e escuro.
- [ ] As permissões dos quatro perfis foram conferidas.
- [ ] README e CHANGELOG atualizados, se a mudança for visível para quem usa.
