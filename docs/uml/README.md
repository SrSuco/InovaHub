# Diagramas UML

Os diagramas estão escritos em [Mermaid](https://mermaid.js.org/), que o GitHub desenha direto na página. Cada arquivo traz o código do diagrama e uma explicação curta. Uma cópia em SVG de cada um fica em [`imagens/`](imagens/), para usar em apresentações e no relatório.

| Diagrama | Arquivo | O que mostra |
| --- | --- | --- |
| Casos de uso | [casos-de-uso.md](casos-de-uso.md) | Quem usa o sistema e o que cada perfil pode fazer |
| Classes | [classes.md](classes.md) | Entidades do domínio, atributos e relacionamentos |
| Sequência | [sequencia.md](sequencia.md) | Login, cadastro de empresa e desativação, passando pela API e pelo banco |
| Estados | [estados.md](estados.md) | Ciclo de vida da empresa, do usuário e das oportunidades |
| Componentes e implantação | [componentes.md](componentes.md) | Camadas do front-end, da API e do banco MySQL |

O modelo físico do banco (tabelas, chaves e índices) está em [`docs/banco-de-dados.md`](../banco-de-dados.md).
