# Diagrama de classes

## Domínio

A **Empresa** é o centro do modelo: contatos, oportunidades, interações, vínculos, candidaturas e indicadores pertencem sempre a uma empresa. As classes em destaque (Empresa, Desativacao, Usuario, Perfil e Permissao) já estão implementadas nas telas e na API. As demais estão no banco e entram nos próximos módulos.

Todas as entidades têm `id`, `criadoEm` e `atualizadoEm`, omitidos no desenho para deixá-lo legível.

```mermaid
classDiagram
  direction LR

  class Perfil {
    +String nome
    +String descricao
  }
  class Modulo {
    +String id
    +String nome
    +String acoesPossiveis
  }
  class Permissao {
    +String acoes
    +permite(acao) bool
  }
  class Usuario {
    +String nome
    +String login
    +String email
    -String senhaHash
    +SituacaoUsuario situacao
    +String cargo
    +String vinculo
    +String telefone
    +DateTime ultimoAcesso
    +autenticar(senha) bool
    +trocarSenha(atual, nova)
  }
  class Empresa {
    +String razaoSocial
    +String nomeFantasia
    +String cnpj
    +String inscricaoEstadual
    +Date dataFundacao
    +String porte
    +String site
    +String categoria
    +String setor
    +Date dataEntrada
    +String contatoNome
    +String contatoCargo
    +String email
    +String telefone
    +Endereco endereco
    +String observacoes
    +SituacaoEmpresa situacao
    +diasSemInteracao() int
    +desativar(motivo, dataSaida, observacao)
    +reativar()
  }
  class Endereco {
    <<valor>>
    +String cep
    +String logradouro
    +String numero
    +String complemento
    +String bairro
    +String cidade
    +String uf
  }
  class Desativacao {
    +String motivo
    +Date dataSaida
    +String observacao
    +DateTime desativadoEm
    +DateTime reativadoEm
  }
  class Contato {
    +String nome
    +String email
    +String telefone
    +String linkedin
    +String origem
    +String vinculoUniville
    +Date consentimentoLgpd
    +anonimizar()
  }
  class ContatoEmpresa {
    +String papel
    +bool principal
    +Date inicio
    +Date fim
  }
  class Interacao {
    +String tipo
    +DateTime data
    +String resumo
    +bool privada
  }
  class Oportunidade {
    +String titulo
    +String tipo
    +EtapaOportunidade etapa
    +Decimal valorEstimado
    +Date dataPrevista
    +String motivoPerda
    +avancar(etapa)
  }
  class Evento {
    +String nome
    +String tipo
    +DateTime inicio
    +DateTime fim
    +String local
    +int capacidade
    +String publico
    +vagasRestantes() int
  }
  class Participacao {
    +StatusParticipacao status
    +int avaliacao
  }
  class Vinculo {
    +String modalidade
    +String fase
    +Date inicio
    +Date fimPrevisto
    +Date fimReal
    +String espaco
    +String motivoSaida
  }
  class Programa {
    +String nome
    +String edital
    +Date inscricoesAte
    +int vagas
    +String status
  }
  class Candidatura {
    +Decimal nota
    +String parecer
    +String resultado
  }
  class Tarefa {
    +String titulo
    +Date prazo
    +bool concluida
  }
  class Indicador {
    +String periodo
    +Decimal faturamento
    +int empregos
    +int clientes
    +Decimal captacao
    +int propriedadeIntelectual
  }

  class SituacaoEmpresa {
    <<enumeration>>
    Ativa
    Desativada
  }
  class SituacaoUsuario {
    <<enumeration>>
    Ativo
    Convite pendente
    Desativado
  }

  Perfil "1" -- "*" Usuario : define acesso de
  Perfil "1" *-- "*" Permissao
  Modulo "1" -- "*" Permissao

  Usuario "1" -- "*" Empresa : responsável por
  Empresa *-- Endereco
  Empresa "1" *-- "0..*" Desativacao : histórico
  Empresa "1" -- "*" ContatoEmpresa
  Contato "1" -- "*" ContatoEmpresa
  Empresa "1" -- "*" Interacao
  Usuario "1" -- "*" Interacao : registra
  Interacao "*" -- "*" Contato : participantes
  Empresa "1" -- "*" Oportunidade
  Usuario "1" -- "*" Oportunidade : responsável
  Oportunidade "0..1" -- "*" Interacao
  Evento "1" -- "*" Participacao
  Contato "1" -- "*" Participacao
  Empresa "0..1" -- "*" Participacao : representada
  Programa "0..1" -- "*" Evento
  Programa "1" -- "*" Candidatura
  Empresa "1" -- "*" Candidatura
  Empresa "1" -- "*" Vinculo
  Empresa "1" -- "*" Indicador
  Usuario "1" -- "*" Tarefa : dono
  Empresa "1" -- "*" Tarefa

  Empresa ..> SituacaoEmpresa
  Usuario ..> SituacaoUsuario
```

### Regras que o diagrama não mostra

- **Exclusão lógica.** Empresas e usuários nunca são apagados. A empresa desativada ganha um registro em `Desativacao`; ao ser reativada, o registro recebe `reativadoEm` e fica no histórico.
- **CNPJ único e imutável.** É validado (dígitos verificadores) no cadastro e não pode ser alterado na edição.
- **Categoria derivada.** Quando houver um `Vinculo` vigente, a categoria da empresa (pré-incubada, incubada, residente) vem dele.
- **LGPD.** Um pedido de remoção anonimiza o `Contato` em vez de apagá-lo, para não quebrar o histórico de interações.

## Aplicação (front-end e API)

Este diagrama mostra como o código está organizado em volta das entidades acima. As telas nunca falam com o banco: chamam um serviço, que chama a API, que usa um repositório.

```mermaid
classDiagram
  direction LR

  class ListaEmpresas {
    <<tela React>>
    -filtros
    +render()
  }
  class FormularioEmpresa {
    <<tela React>>
    -dados
    -erros
    +salvar()
  }
  class SessaoContext {
    <<contexto React>>
    +usuario
    +matriz
    +entrar(login, senha, manter)
    +sair()
    +pode(modulo, acao) bool
  }
  class empresasService {
    <<serviço>>
    +listarEmpresas()
    +obterEmpresa(id)
    +criarEmpresa(dados)
    +atualizarEmpresa(id, dados)
    +desativarEmpresa(id, motivo)
    +reativarEmpresa(id)
  }
  class clienteApi {
    <<http>>
    +requisitar(metodo, caminho, corpo)
  }
  class rotasEmpresas {
    <<Express Router>>
    GET /empresas
    GET /empresas/:id
    POST /empresas
    PUT /empresas/:id
    POST /empresas/:id/desativar
    POST /empresas/:id/reativar
  }
  class autenticacao {
    <<middleware>>
    +exigirLogin()
    +exigirPermissao(modulo, acao)
  }
  class empresasRepositorio {
    <<repositório>>
    +listar()
    +obter(id)
    +buscarPorCnpj(cnpj)
    +criar(dados, usuarioId)
    +atualizar(id, dados)
    +desativar(id, dados, usuarioId)
    +reativar(id, usuarioId)
  }
  class pool {
    <<mysql2>>
    +query(sql, parametros)
    +getConnection()
  }

  ListaEmpresas ..> empresasService
  FormularioEmpresa ..> empresasService
  ListaEmpresas ..> SessaoContext
  empresasService ..> clienteApi
  SessaoContext ..> clienteApi
  clienteApi ..> rotasEmpresas : HTTP + JWT
  rotasEmpresas ..> autenticacao
  rotasEmpresas ..> empresasRepositorio
  empresasRepositorio ..> pool
```
