# Diagramas de estados

## Empresa

Uma empresa só tem dois estados no cadastro. Não existe estado "excluída": a desativação é a única forma de tirar uma empresa das listas.

```mermaid
stateDiagram-v2
  [*] --> Ativa : cadastrar (CNPJ válido e único)
  Ativa --> Ativa : editar dados
  Ativa --> Desativada : desativar (motivo + data de saída)
  Desativada --> Ativa : reativar
  note right of Desativada
    Some das listas padrão,
    não pode ser editada,
    mantém todo o histórico.
  end note
```

## Usuário

```mermaid
stateDiagram-v2
  [*] --> ConvitePendente : Administrador cadastra
  ConvitePendente --> Ativo : primeiro acesso
  ConvitePendente --> Desativado : cancelar convite
  Ativo --> Desativado : desativar
  Desativado --> Ativo : reativar
  ConvitePendente : Convite pendente
```

## Oportunidade (próximo módulo)

Um único funil para todos os tipos de oportunidade (incubação, residência, parceria, patrocínio, investimento, edital).

```mermaid
stateDiagram-v2
  direction LR
  [*] --> Identificada
  Identificada --> Qualificada
  Qualificada --> Proposta
  Proposta --> Negociacao
  Negociacao --> Ganha
  Identificada --> Perdida
  Qualificada --> Perdida
  Proposta --> Perdida
  Negociacao --> Perdida : exige motivo
  Ganha --> [*]
  Perdida --> [*]
  Negociacao : Negociação
```
