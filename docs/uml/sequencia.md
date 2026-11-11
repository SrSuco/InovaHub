# Diagramas de sequência

## 1. Entrar no sistema

A senha nunca sai do banco: a API compara o hash com bcrypt e devolve um token JWT, que o navegador envia em todas as chamadas seguintes.

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuário
  participant L as Tela de login
  participant S as SessaoContext
  participant A as API (/api/auth)
  participant DB as MySQL

  U->>L: informa login e senha
  L->>S: entrar(login, senha, manterConectado)
  S->>A: POST /auth/login
  A->>DB: SELECT usuário por login ou e-mail
  DB-->>A: usuário + senha_hash + perfil
  alt senha confere e usuário ativo
    A->>DB: UPDATE ultimo_acesso
    A->>DB: SELECT matriz de permissões
    A-->>S: 200 { token, usuario, matriz }
    S-->>L: sessão iniciada
    L-->>U: abre o painel
  else senha errada, convite pendente ou desativado
    A-->>S: 401 "Usuário ou senha incorretos."
    S-->>L: erro
    L-->>U: mostra a mensagem no formulário
  end
```

## 2. Cadastrar empresa

A validação acontece duas vezes: no navegador, para dar retorno imediato, e na API, que usa as mesmas regras e é quem confere o CNPJ duplicado no banco.

```mermaid
sequenceDiagram
  autonumber
  actor U as Analista
  participant F as FormularioEmpresa
  participant SV as empresasService
  participant A as API (/api/empresas)
  participant R as empresasRepositorio
  participant DB as MySQL

  U->>F: preenche o CNPJ
  F->>SV: consultarCnpj(cnpj)
  SV-->>F: razão social, porte, endereço
  U->>F: completa e clica em Salvar
  F->>F: validarEmpresa(dados, "nova")
  alt há erros no formulário
    F-->>U: resumo de erros e campos destacados
  else formulário válido
    F->>SV: criarEmpresa(dados)
    SV->>A: POST /empresas (Bearer token)
    A->>A: exigirPermissao("empresas", "C")
    A->>A: validarEmpresa(dados, "nova")
    A->>R: buscarPorCnpj(cnpj)
    R->>DB: SELECT ... WHERE cnpj = ?
    alt CNPJ já cadastrado
      A-->>SV: 422 { campos: { cnpj: "Este CNPJ já está cadastrado..." } }
      SV-->>F: ErroValidacao
      F-->>U: erro no campo CNPJ
    else CNPJ livre
      A->>R: criar(dados, usuarioId)
      R->>DB: INSERT INTO empresas
      DB-->>R: id
      A-->>SV: 201 empresa
      SV-->>F: empresa criada
      F-->>U: abre a ficha com aviso de sucesso
    end
  end
```

## 3. Desativar empresa

A desativação grava a situação e o histórico na mesma transação. Nenhum registro é apagado.

```mermaid
sequenceDiagram
  autonumber
  actor G as Gerência
  participant M as ModalDesativarEmpresa
  participant SV as empresasService
  participant A as API (/api/empresas)
  participant R as empresasRepositorio
  participant DB as MySQL

  G->>M: escolhe motivo, data de saída e observação
  M->>SV: desativarEmpresa(id, dados)
  SV->>A: POST /empresas/:id/desativar
  A->>A: exigirPermissao("empresas", "D")
  A->>R: desativar(id, dados, usuarioId)
  R->>DB: BEGIN
  R->>DB: UPDATE empresas SET situacao = 'Desativada'
  R->>DB: INSERT INTO empresa_desativacoes
  R->>DB: COMMIT
  A-->>SV: 200 empresa desativada
  SV-->>M: ok
  M-->>G: fecha o modal e mostra o aviso
```
