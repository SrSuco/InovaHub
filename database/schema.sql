-- =====================================================================
-- InovaHub CRM · esquema do banco de dados
-- Compatível com MySQL 8.0+ e MariaDB 10.6+
--
-- Uso:
--   CREATE DATABASE inovahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   mysql -u <usuario> -p inovahub < database/schema.sql
--
-- Regras gerais:
--   * Nada é apagado: empresas e usuários são desativados (exclusão lógica).
--   * Toda tabela de negócio tem criado_em e atualizado_em.
--   * Textos em utf8mb4 para aceitar acentos e emojis.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW  IF EXISTS vw_empresas;
DROP TABLE IF EXISTS indicadores;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS candidaturas;
DROP TABLE IF EXISTS vinculos;
DROP TABLE IF EXISTS interacao_contatos;
DROP TABLE IF EXISTS interacoes;
DROP TABLE IF EXISTS oportunidades;
DROP TABLE IF EXISTS participacoes;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS programas;
DROP TABLE IF EXISTS contato_empresa;
DROP TABLE IF EXISTS contatos;
DROP TABLE IF EXISTS empresa_desativacoes;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS permissoes;
DROP TABLE IF EXISTS modulos;
DROP TABLE IF EXISTS perfis;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Acesso: perfis, módulos e matriz de permissões
-- ---------------------------------------------------------------------

CREATE TABLE perfis (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(30)  NOT NULL,
  descricao   VARCHAR(200) NOT NULL DEFAULT '',
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_perfis_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Perfis de acesso: Administrador, Gerência, Analista e Consulta';

CREATE TABLE modulos (
  id               VARCHAR(30) NOT NULL,
  nome             VARCHAR(60) NOT NULL,
  acoes_possiveis  VARCHAR(5)  NOT NULL COMMENT 'V ver, C criar, E editar, D desativar, P exportar',
  ordem            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Módulos do sistema e as ações que fazem sentido em cada um';

CREATE TABLE permissoes (
  perfil_id   TINYINT UNSIGNED NOT NULL,
  modulo_id   VARCHAR(30) NOT NULL,
  acoes       VARCHAR(5)  NOT NULL DEFAULT '' COMMENT 'Subconjunto de modulos.acoes_possiveis',
  PRIMARY KEY (perfil_id, modulo_id),
  CONSTRAINT fk_permissoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id),
  CONSTRAINT fk_permissoes_modulo FOREIGN KEY (modulo_id) REFERENCES modulos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Matriz perfil x módulo editada na tela de Permissões';

CREATE TABLE usuarios (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(120) NOT NULL,
  login          VARCHAR(60)  NOT NULL,
  email          VARCHAR(160) NOT NULL,
  senha_hash     CHAR(60)     NOT NULL COMMENT 'bcrypt',
  perfil_id      TINYINT UNSIGNED NOT NULL,
  situacao       ENUM('Ativo','Convite pendente','Desativado') NOT NULL DEFAULT 'Convite pendente',
  cargo          VARCHAR(80)  NOT NULL DEFAULT '',
  vinculo        VARCHAR(40)  NOT NULL DEFAULT 'Equipe do parque',
  telefone       VARCHAR(20)  NOT NULL DEFAULT '',
  ultimo_acesso  DATETIME     NULL,
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_login (login),
  UNIQUE KEY uq_usuarios_email (email),
  KEY ix_usuarios_perfil (perfil_id),
  CONSTRAINT fk_usuarios_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Equipe do parque e convidados que usam o CRM';

-- ---------------------------------------------------------------------
-- Empresas (centro do modelo)
-- ---------------------------------------------------------------------

CREATE TABLE empresas (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  razao_social        VARCHAR(150) NOT NULL,
  nome_fantasia       VARCHAR(120) NOT NULL DEFAULT '',
  cnpj                CHAR(14)     NULL COMMENT 'Somente dígitos; único quando preenchido',
  inscricao_estadual  VARCHAR(20)  NOT NULL DEFAULT '',
  data_fundacao       DATE         NULL,
  porte               VARCHAR(30)  NOT NULL DEFAULT '',
  site                VARCHAR(200) NOT NULL DEFAULT '',
  categoria           VARCHAR(30)  NOT NULL,
  setor               VARCHAR(40)  NOT NULL,
  responsavel_id      INT UNSIGNED NOT NULL COMMENT 'Gestor da conta na equipe do parque',
  data_entrada        DATE         NULL COMMENT 'Entrada no parque',
  contato_nome        VARCHAR(120) NOT NULL,
  contato_cargo       VARCHAR(80)  NOT NULL DEFAULT '',
  email               VARCHAR(160) NOT NULL,
  telefone            VARCHAR(20)  NOT NULL,
  cep                 VARCHAR(9)   NOT NULL DEFAULT '',
  logradouro          VARCHAR(150) NOT NULL DEFAULT '',
  numero              VARCHAR(10)  NOT NULL DEFAULT '',
  complemento         VARCHAR(80)  NOT NULL DEFAULT '',
  bairro              VARCHAR(80)  NOT NULL DEFAULT '',
  cidade              VARCHAR(80)  NOT NULL,
  uf                  CHAR(2)      NOT NULL DEFAULT '',
  observacoes         TEXT         NULL,
  situacao            ENUM('Ativa','Desativada') NOT NULL DEFAULT 'Ativa',
  criado_por          INT UNSIGNED NULL,
  criado_em           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_empresas_cnpj (cnpj),
  KEY ix_empresas_situacao (situacao),
  KEY ix_empresas_categoria (categoria),
  KEY ix_empresas_setor (setor),
  KEY ix_empresas_responsavel (responsavel_id),
  KEY ix_empresas_nome (nome_fantasia, razao_social),
  CONSTRAINT fk_empresas_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios (id),
  CONSTRAINT fk_empresas_criado_por  FOREIGN KEY (criado_por)     REFERENCES usuarios (id),
  CONSTRAINT ck_empresas_categoria CHECK (categoria IN
    ('Prospect','Pré-incubada','Incubada','Residente','Graduada','Parceira','Investidor','Instituição')),
  CONSTRAINT ck_empresas_porte CHECK (porte IN
    ('','MEI','Microempresa (ME)','Pequeno porte (EPP)','Médio porte','Grande porte')),
  CONSTRAINT ck_empresas_cnpj CHECK (cnpj IS NULL OR cnpj REGEXP '^[0-9]{14}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Organizações com que o parque se relaciona. Nunca são excluídas.';

CREATE TABLE empresa_desativacoes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id      INT UNSIGNED NOT NULL,
  motivo          VARCHAR(60)  NOT NULL,
  data_saida      DATE         NOT NULL,
  observacao      TEXT         NULL,
  desativado_por  INT UNSIGNED NULL,
  desativado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reativado_por   INT UNSIGNED NULL,
  reativado_em    DATETIME     NULL,
  -- 1 enquanto a desativação está vigente; NULL depois da reativação.
  -- Com a chave única abaixo, cada empresa tem no máximo uma desativação aberta.
  vigente         TINYINT AS (IF(reativado_em IS NULL, 1, NULL)) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_desativacao_vigente (empresa_id, vigente),
  CONSTRAINT fk_desativacoes_empresa   FOREIGN KEY (empresa_id)     REFERENCES empresas (id),
  CONSTRAINT fk_desativacoes_por       FOREIGN KEY (desativado_por) REFERENCES usuarios (id),
  CONSTRAINT fk_desativacoes_reativado FOREIGN KEY (reativado_por)  REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Histórico de desativações e reativações de cada empresa';

-- ---------------------------------------------------------------------
-- Pessoas
-- ---------------------------------------------------------------------

CREATE TABLE contatos (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                VARCHAR(120) NOT NULL,
  email               VARCHAR(160) NULL,
  telefone            VARCHAR(20)  NOT NULL DEFAULT '',
  linkedin            VARCHAR(200) NOT NULL DEFAULT '',
  origem              ENUM('Evento','Indicação','Site','Edital','Universidade') NULL,
  vinculo_univille    ENUM('Nenhum','Aluno','Egresso','Professor','Servidor') NOT NULL DEFAULT 'Nenhum',
  consentimento_lgpd  DATE         NULL COMMENT 'Sem aceite, não recebe comunicação em massa',
  anonimizado         BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'Pedido de remoção pela LGPD',
  criado_por          INT UNSIGNED NULL,
  criado_em           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_contatos_email (email),
  CONSTRAINT fk_contatos_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pessoas de fora da equipe; podem passar por várias empresas';

CREATE TABLE contato_empresa (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  contato_id  INT UNSIGNED NOT NULL,
  empresa_id  INT UNSIGNED NOT NULL,
  papel       ENUM('Sócio-fundador','CEO','Ponto focal','Financeiro','Técnico','Outro') NOT NULL DEFAULT 'Ponto focal',
  principal   BOOLEAN      NOT NULL DEFAULT FALSE,
  inicio      DATE         NULL,
  fim         DATE         NULL,
  PRIMARY KEY (id),
  KEY ix_contato_empresa_empresa (empresa_id),
  KEY ix_contato_empresa_contato (contato_id),
  CONSTRAINT fk_ce_contato FOREIGN KEY (contato_id) REFERENCES contatos (id),
  CONSTRAINT fk_ce_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT ck_ce_periodo CHECK (fim IS NULL OR inicio IS NULL OR fim >= inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Papel de cada pessoa em cada empresa (N:N)';

-- ---------------------------------------------------------------------
-- Programas, eventos e participação
-- ---------------------------------------------------------------------

CREATE TABLE programas (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(120) NOT NULL,
  edital          VARCHAR(60)  NOT NULL DEFAULT '',
  inscricoes_ate  DATE         NULL,
  vagas           SMALLINT UNSIGNED NULL,
  status          ENUM('Planejado','Inscrições abertas','Em avaliação','Encerrado') NOT NULL DEFAULT 'Planejado',
  criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Editais e turmas de seleção e aceleração';

CREATE TABLE eventos (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(150) NOT NULL,
  tipo           ENUM('Workshop','Palestra','Mentoria coletiva','Banca','Demo day','Networking') NOT NULL,
  inicio         DATETIME     NOT NULL,
  fim            DATETIME     NULL,
  local          VARCHAR(120) NOT NULL DEFAULT '',
  capacidade     SMALLINT UNSIGNED NULL COMMENT 'Ao lotar, novas inscrições vão para a lista de espera',
  publico        ENUM('Aberto','Empresas do parque','Convidados') NOT NULL DEFAULT 'Aberto',
  programa_id    INT UNSIGNED NULL,
  criado_por     INT UNSIGNED NULL,
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_eventos_inicio (inicio),
  CONSTRAINT fk_eventos_programa   FOREIGN KEY (programa_id) REFERENCES programas (id),
  CONSTRAINT fk_eventos_criado_por FOREIGN KEY (criado_por)  REFERENCES usuarios (id),
  CONSTRAINT ck_eventos_periodo CHECK (fim IS NULL OR fim >= inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE participacoes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  evento_id   INT UNSIGNED NOT NULL,
  contato_id  INT UNSIGNED NOT NULL,
  empresa_id  INT UNSIGNED NULL COMMENT 'Empresa que a pessoa representou no evento',
  status      ENUM('Inscrito','Confirmado','Presente','Ausente','Lista de espera') NOT NULL DEFAULT 'Inscrito',
  avaliacao   TINYINT UNSIGNED NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_participacao (evento_id, contato_id),
  CONSTRAINT fk_participacoes_evento  FOREIGN KEY (evento_id)  REFERENCES eventos (id),
  CONSTRAINT fk_participacoes_contato FOREIGN KEY (contato_id) REFERENCES contatos (id),
  CONSTRAINT fk_participacoes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT ck_participacoes_avaliacao CHECK (avaliacao IS NULL OR avaliacao BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Oportunidades e interações
-- ---------------------------------------------------------------------

CREATE TABLE oportunidades (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo                VARCHAR(150) NOT NULL,
  tipo                  ENUM('Nova incubação','Residência','Parceria/convênio','Projeto com a universidade',
                             'Patrocínio','Investimento','Edital de fomento') NOT NULL,
  empresa_id            INT UNSIGNED NOT NULL,
  contato_principal_id  INT UNSIGNED NULL,
  responsavel_id        INT UNSIGNED NOT NULL,
  etapa                 ENUM('Identificada','Qualificada','Proposta','Negociação','Ganha','Perdida')
                        NOT NULL DEFAULT 'Identificada',
  valor_estimado        DECIMAL(12,2) NULL,
  data_prevista         DATE         NULL,
  motivo_perda          VARCHAR(60)  NULL,
  motivo_perda_detalhe  TEXT         NULL,
  criado_por            INT UNSIGNED NULL,
  criado_em             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_oportunidades_empresa (empresa_id),
  KEY ix_oportunidades_etapa (etapa),
  CONSTRAINT fk_oportunidades_empresa     FOREIGN KEY (empresa_id)           REFERENCES empresas (id),
  CONSTRAINT fk_oportunidades_contato     FOREIGN KEY (contato_principal_id) REFERENCES contatos (id),
  CONSTRAINT fk_oportunidades_responsavel FOREIGN KEY (responsavel_id)       REFERENCES usuarios (id),
  CONSTRAINT fk_oportunidades_criado_por  FOREIGN KEY (criado_por)           REFERENCES usuarios (id),
  CONSTRAINT ck_oportunidades_perda CHECK (etapa <> 'Perdida' OR motivo_perda IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Funil único: incubação, residência, parceria, patrocínio, investimento, edital';

CREATE TABLE interacoes (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id       INT UNSIGNED NOT NULL,
  usuario_id       INT UNSIGNED NOT NULL COMMENT 'Quem registrou',
  tipo             VARCHAR(40)  NOT NULL COMMENT 'Reunião, visita, ligação, e-mail, WhatsApp, mentoria, acompanhamento',
  data             DATETIME     NOT NULL,
  resumo           TEXT         NOT NULL,
  privada          BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'Visível só para quem tem o módulo "privadas"',
  oportunidade_id  INT UNSIGNED NULL,
  evento_id        INT UNSIGNED NULL,
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_interacoes_empresa_data (empresa_id, data),
  CONSTRAINT fk_interacoes_empresa      FOREIGN KEY (empresa_id)      REFERENCES empresas (id),
  CONSTRAINT fk_interacoes_usuario      FOREIGN KEY (usuario_id)      REFERENCES usuarios (id),
  CONSTRAINT fk_interacoes_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidades (id),
  CONSTRAINT fk_interacoes_evento       FOREIGN KEY (evento_id)       REFERENCES eventos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Linha do tempo de cada empresa';

CREATE TABLE interacao_contatos (
  interacao_id  INT UNSIGNED NOT NULL,
  contato_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (interacao_id, contato_id),
  CONSTRAINT fk_ic_interacao FOREIGN KEY (interacao_id) REFERENCES interacoes (id),
  CONSTRAINT fk_ic_contato   FOREIGN KEY (contato_id)   REFERENCES contatos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quem participou de cada interação do lado da empresa (N:N)';

-- ---------------------------------------------------------------------
-- Ciclo da empresa no parque
-- ---------------------------------------------------------------------

CREATE TABLE vinculos (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id     INT UNSIGNED NOT NULL,
  modalidade     ENUM('Pré-incubação','Incubação','Residência') NOT NULL,
  fase           VARCHAR(40)  NOT NULL DEFAULT '',
  inicio         DATE         NOT NULL,
  fim_previsto   DATE         NULL,
  fim_real       DATE         NULL,
  espaco         VARCHAR(60)  NOT NULL DEFAULT '' COMMENT 'Sala ou bloco ocupado no parque',
  motivo_saida   VARCHAR(120) NULL COMMENT 'Obrigatório em saída antecipada',
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_vinculos_empresa (empresa_id, inicio),
  CONSTRAINT fk_vinculos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT ck_vinculos_periodo CHECK (fim_real IS NULL OR fim_real >= inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Contrato da empresa com o parque, um por ciclo';

CREATE TABLE candidaturas (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  programa_id    INT UNSIGNED NOT NULL,
  empresa_id     INT UNSIGNED NOT NULL,
  nota           DECIMAL(4,2) NULL,
  parecer        TEXT         NULL,
  resultado      ENUM('Em avaliação','Aprovada','Reprovada','Desistiu') NOT NULL DEFAULT 'Em avaliação',
  criado_em      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_candidatura (programa_id, empresa_id),
  CONSTRAINT fk_candidaturas_programa FOREIGN KEY (programa_id) REFERENCES programas (id),
  CONSTRAINT fk_candidaturas_empresa  FOREIGN KEY (empresa_id)  REFERENCES empresas (id),
  CONSTRAINT ck_candidaturas_nota CHECK (nota IS NULL OR nota BETWEEN 0 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tarefas (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo           VARCHAR(150) NOT NULL,
  prazo            DATE         NULL,
  responsavel_id   INT UNSIGNED NOT NULL,
  empresa_id       INT UNSIGNED NULL,
  oportunidade_id  INT UNSIGNED NULL,
  interacao_id     INT UNSIGNED NULL,
  concluida        BOOLEAN      NOT NULL DEFAULT FALSE,
  concluida_em     DATETIME     NULL,
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_tarefas_responsavel (responsavel_id, concluida, prazo),
  CONSTRAINT fk_tarefas_responsavel  FOREIGN KEY (responsavel_id)  REFERENCES usuarios (id),
  CONSTRAINT fk_tarefas_empresa      FOREIGN KEY (empresa_id)      REFERENCES empresas (id),
  CONSTRAINT fk_tarefas_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidades (id),
  CONSTRAINT fk_tarefas_interacao    FOREIGN KEY (interacao_id)    REFERENCES interacoes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Próximos passos com dono e prazo';

CREATE TABLE indicadores (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id               INT UNSIGNED NOT NULL,
  periodo                  CHAR(7)      NOT NULL COMMENT 'AAAA-MM',
  faturamento              DECIMAL(14,2) NULL,
  empregos                 SMALLINT UNSIGNED NULL,
  clientes                 INT UNSIGNED NULL,
  captacao                 DECIMAL(14,2) NULL,
  propriedade_intelectual  SMALLINT UNSIGNED NULL COMMENT 'Patentes, registros de software e marcas',
  criado_em                DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_indicadores_periodo (empresa_id, periodo),
  CONSTRAINT fk_indicadores_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id),
  CONSTRAINT ck_indicadores_periodo CHECK (periodo REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Dados que a empresa reporta periodicamente';

-- ---------------------------------------------------------------------
-- Visão usada pela listagem de empresas
-- ---------------------------------------------------------------------

CREATE VIEW vw_empresas AS
SELECT
  e.*,
  COALESCE(DATEDIFF(CURRENT_DATE, ui.ultima), DATEDIFF(CURRENT_DATE, e.criado_em)) AS dias_sem_interacao,
  d.motivo     AS desativacao_motivo,
  d.data_saida AS desativacao_data_saida,
  d.observacao AS desativacao_observacao
FROM empresas e
LEFT JOIN (
  SELECT empresa_id, MAX(data) AS ultima
  FROM interacoes
  GROUP BY empresa_id
) ui ON ui.empresa_id = e.id
LEFT JOIN empresa_desativacoes d
  ON d.empresa_id = e.id AND d.reativado_em IS NULL;
