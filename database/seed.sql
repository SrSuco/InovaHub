-- =====================================================================
-- InovaHub CRM · carga inicial (dados de demonstração)
-- Os mesmos dados do protótipo de telas. CNPJs fictícios com dígitos válidos.
-- Senha de todos os usuários: inovahub
--
-- Uso (depois do schema.sql):
--   mysql -u <usuario> -p inovahub < database/seed.sql
-- =====================================================================

SET NAMES utf8mb4;

-- Perfis
INSERT INTO perfis (id, nome, descricao, ordem) VALUES
  (1, 'Administrador', 'Acesso total, inclusive usuários, permissões e desativação de empresas.', 1),
  (2, 'Gerência', 'Vê e edita tudo, vê interações privadas e desativa empresas. Não gerencia usuários.', 2),
  (3, 'Analista', 'Cria e edita empresas e registra interações.', 3),
  (4, 'Consulta', 'Somente leitura de empresas, eventos e relatórios. Ideal para professores e avaliadores.', 4);

-- Módulos
INSERT INTO modulos (id, nome, acoes_possiveis, ordem) VALUES
  ('dashboard', 'Dashboard', 'V', 1),
  ('empresas', 'Empresas', 'VCEDP', 2),
  ('interacoes', 'Interações', 'VCED', 3),
  ('privadas', 'Interações privadas', 'VCE', 4),
  ('relatorios', 'Relatórios', 'VP', 5),
  ('usuarios', 'Usuários', 'VCED', 6),
  ('permissoes', 'Permissões', 'VE', 7),
  ('configuracoes', 'Configurações do parque', 'VE', 8);

-- Matriz de permissões padrão
INSERT INTO permissoes (perfil_id, modulo_id, acoes) VALUES
  (1, 'dashboard', 'V'),
  (1, 'empresas', 'VCEDP'),
  (1, 'interacoes', 'VCED'),
  (1, 'privadas', 'VCE'),
  (1, 'relatorios', 'VP'),
  (1, 'usuarios', 'VCED'),
  (1, 'permissoes', 'VE'),
  (1, 'configuracoes', 'VE'),
  (2, 'dashboard', 'V'),
  (2, 'empresas', 'VCEDP'),
  (2, 'interacoes', 'VCE'),
  (2, 'privadas', 'VCE'),
  (2, 'relatorios', 'VP'),
  (2, 'usuarios', ''),
  (2, 'permissoes', ''),
  (2, 'configuracoes', 'VE'),
  (3, 'dashboard', 'V'),
  (3, 'empresas', 'VCE'),
  (3, 'interacoes', 'VCE'),
  (3, 'privadas', ''),
  (3, 'relatorios', 'VP'),
  (3, 'usuarios', ''),
  (3, 'permissoes', ''),
  (3, 'configuracoes', ''),
  (4, 'dashboard', 'V'),
  (4, 'empresas', 'V'),
  (4, 'interacoes', ''),
  (4, 'privadas', ''),
  (4, 'relatorios', 'V'),
  (4, 'usuarios', ''),
  (4, 'permissoes', ''),
  (4, 'configuracoes', '');

-- Usuários (senha: inovahub)
INSERT INTO usuarios (id, nome, login, email, senha_hash, perfil_id, situacao, cargo, vinculo, telefone, ultimo_acesso) VALUES
  (1, 'Gabriel Nasário', 'admin', 'admin@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 1, 'Ativo', 'Estagiário de desenvolvimento', 'Equipe do parque', '(47) 3461-9000', NOW()),
  (2, 'Carlos Mendes', 'gerencia', 'carlos.mendes@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 2, 'Ativo', 'Gerente do parque', 'Equipe do parque', '(47) 3461-9001', NOW() - INTERVAL 1 HOUR),
  (3, 'Marina Kowalski', 'analista', 'marina.k@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 3, 'Ativo', 'Analista de relacionamento', 'Equipe do parque', '(47) 3461-9002', NOW() - INTERVAL 2 HOUR),
  (4, 'Rafael Teixeira', 'rafael', 'rafael.t@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 3, 'Ativo', 'Analista de projetos', 'Equipe do parque', '(47) 3461-9003', NOW() - INTERVAL 1 DAY),
  (5, 'Profa. Helena Duarte', 'consulta', 'helena.duarte@univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 4, 'Ativo', 'Professora avaliadora', 'Professor UNIVILLE', '', NOW() - INTERVAL 6 DAY),
  (6, 'Beatriz Alves', 'beatriz', 'beatriz.alves@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 3, 'Convite pendente', 'Analista de eventos', 'Equipe do parque', '', NULL),
  (7, 'João Pedro Lima', 'joao', 'joao.lima@inovaparq.univille.br', '$2a$10$QZtVISBpwxbfx2OuFldiVOilhLChI21YDwfnWmx/9gO5xhu2o9oim', 3, 'Desativado', 'Ex-estagiário', 'Equipe do parque', '', NOW() - INTERVAL 4 MONTH);

-- Empresas
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, data_fundacao, porte, site, categoria, setor, responsavel_id, data_entrada, contato_nome, contato_cargo, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf, observacoes, situacao, criado_por, criado_em, atualizado_em) VALUES
  (1, 'Nexa Sensores Ltda.', 'Nexa Sensores', '52601815000120', '', '2021-03-15', 'Microempresa (ME)', 'https://nexasensores.com.br', 'Incubada', 'Indústria 4.0', 1, '2025-03-12', 'Lucas Ferreira', 'CEO e fundador', 'lucas@nexasensores.com.br', '(47) 99812-4410', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2025-03-12 09:00:00', '2025-03-12 09:00:00'),
  (2, 'AgroVale Analytics S.A.', 'AgroVale', '90830166000128', '', '2021-03-15', 'Médio porte', 'https://agrovale.com.br', 'Residente', 'Agronegócio', 3, '2023-08-01', 'Daniela Weiss', 'Diretora de operações', 'daniela@agrovale.ag', '(47) 3027-5512', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2023-08-01 09:00:00', '2023-08-01 09:00:00'),
  (3, 'Bioforma Saúde Ltda.', 'Bioforma', '13186091000143', '', '2021-03-15', 'Pequeno porte (EPP)', 'https://bioforma.com.br', 'Residente', 'Saúde', 1, '2024-02-20', 'Rodrigo Alves', 'Sócio', 'rodrigo@bioforma.med.br', '(47) 98455-1203', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2024-02-20 09:00:00', '2024-02-20 09:00:00'),
  (4, 'Vetor Energia Ltda.', 'Vetor Energia', '39099603000128', '', '2021-03-15', 'Microempresa (ME)', 'https://vetorenergia.com.br', 'Incubada', 'Energia', 4, '2025-06-03', 'Ana Beatriz Costa', 'CEO', 'ana@vetorenergia.com.br', '(47) 99120-8834', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2025-06-03 09:00:00', '2025-06-03 09:00:00'),
  (5, 'Kora Software ME', 'Kora', '08246281000179', '', '2021-03-15', 'MEI', 'https://kora.dev', 'Pré-incubada', 'Software', 3, '2026-04-10', 'Thiago Brandt', 'Fundador', 'thiago@kora.dev', '(47) 99701-2290', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2026-04-10 09:00:00', '2026-04-10 09:00:00'),
  (6, 'Maré Robotics Ltda.', 'Maré Robotics', '94821993000106', '', '2021-03-15', 'Microempresa (ME)', 'https://marerobotics.com.br', 'Incubada', 'Robótica', 3, '2025-09-22', 'Juliana Prates', 'Cofundadora', 'juliana@marerobotics.com', '(47) 99634-7781', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Ativa', 1, '2025-09-22 09:00:00', '2025-09-22 09:00:00'),
  (7, 'Litoral Têxtil Digital Ltda.', 'LTD', '51819093000111', '', '2021-03-15', 'Médio porte', 'https://ltd.com.br', 'Prospect', 'Têxtil', 4, '2026-10-02', 'Sérgio Lenz', 'Gerente de inovação', 'sergio.lenz@ltd.ind.br', '(47) 3431-0098', '89251-000', 'Rua Walter Marquardt', '1200', '', 'Barra do Rio Molha', 'Jaraguá do Sul', 'SC', NULL, 'Ativa', 1, '2026-10-02 09:00:00', '2026-10-02 09:00:00'),
  (8, 'Fundação Catarinense de Fomento', 'FCF', '78657975000184', '', '2021-03-15', 'Grande porte', 'https://fcf.com.br', 'Instituição', 'Fomento', 2, '2022-05-30', 'Helena Rocha', 'Coordenadora de programas', 'programas@fcf.org.br', '(48) 3224-6610', '88015-200', 'Av. Rio Branco', '404', 'sala 1102', 'Centro', 'Florianópolis', 'SC', NULL, 'Ativa', 1, '2022-05-30 09:00:00', '2022-05-30 09:00:00'),
  (9, 'Cria Tecnologia Educacional Ltda.', 'Cria Educação', '43231948000160', '', '2021-03-15', 'Pequeno porte (EPP)', 'https://criaeducacao.com.br', 'Graduada', 'Educação', 1, '2021-02-08', 'Paula Nunes', 'CEO', 'paula@criaedu.com.br', '(47) 99211-3376', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Desativada', 1, '2021-02-08 09:00:00', '2026-06-30 17:00:00'),
  (10, 'Polo Capital Investimentos S.A.', 'Polo Capital', '75749118000116', '', '2021-03-15', 'Médio porte', 'https://polocapital.com.br', 'Investidor', 'Fomento', 2, '2024-11-18', 'Eduardo Klein', 'Sócio-diretor', 'eduardo@polocapital.com.br', '(11) 3055-8800', '04538-132', 'Av. Brig. Faria Lima', '3477', '14º andar', 'Itaim Bibi', 'São Paulo', 'SP', NULL, 'Ativa', 1, '2024-11-18 09:00:00', '2024-11-18 09:00:00'),
  (11, 'WEG Equipamentos Elétricos S.A.', 'WEG Labs', '62527601000104', '', '2021-03-15', 'Grande porte', 'https://weglabs.com.br', 'Parceira', 'Indústria 4.0', 2, '2023-03-07', 'Marcos Dietrich', 'Gerente de inovação aberta', 'inovacao@weglabs.net', '(47) 3276-4000', '89256-900', 'Av. Prefeito Waldemar Grubba', '3300', '', 'Vila Lalau', 'Jaraguá do Sul', 'SC', NULL, 'Ativa', 1, '2023-03-07 09:00:00', '2023-03-07 09:00:00'),
  (12, 'Trama Têxtil Inteligente ME', 'Trama Têxtil', '89555979000178', '', '2021-03-15', 'MEI', 'https://tramatextil.com.br', 'Pré-incubada', 'Têxtil', 4, '2025-01-14', 'Bruna Hass', 'Fundadora', 'bruna.hass@tramatextil.com', '(47) 98801-6650', '89219-710', 'Rua Paulo Malschitzki', '10', 'Inovaparq, bloco B', 'Zona Industrial Norte', 'Joinville', 'SC', NULL, 'Desativada', 1, '2025-01-14 09:00:00', '2025-08-20 17:00:00');

-- Histórico de desativação das empresas desativadas
INSERT INTO empresa_desativacoes (empresa_id, motivo, data_saida, observacao, desativado_por, desativado_em) VALUES
  (9, 'Graduou e saiu do parque', '2026-06-30', NULL, 2, '2026-06-30 17:00:00'),
  (12, 'Desistiu do programa', '2025-08-20', NULL, 2, '2025-08-20 17:00:00');

-- Contatos principais de cada empresa
INSERT INTO contatos (id, nome, email, telefone, origem, consentimento_lgpd, criado_por) VALUES
  (1, 'Lucas Ferreira', 'lucas@nexasensores.com.br', '(47) 99812-4410', 'Edital', '2025-03-12', 1),
  (2, 'Daniela Weiss', 'daniela@agrovale.ag', '(47) 3027-5512', 'Edital', '2023-08-01', 1),
  (3, 'Rodrigo Alves', 'rodrigo@bioforma.med.br', '(47) 98455-1203', 'Edital', '2024-02-20', 1),
  (4, 'Ana Beatriz Costa', 'ana@vetorenergia.com.br', '(47) 99120-8834', 'Edital', '2025-06-03', 1),
  (5, 'Thiago Brandt', 'thiago@kora.dev', '(47) 99701-2290', 'Edital', '2026-04-10', 1),
  (6, 'Juliana Prates', 'juliana@marerobotics.com', '(47) 99634-7781', 'Edital', '2025-09-22', 1),
  (7, 'Sérgio Lenz', 'sergio.lenz@ltd.ind.br', '(47) 3431-0098', 'Edital', '2026-10-02', 1),
  (8, 'Helena Rocha', 'programas@fcf.org.br', '(48) 3224-6610', 'Edital', '2022-05-30', 1),
  (9, 'Paula Nunes', 'paula@criaedu.com.br', '(47) 99211-3376', 'Edital', '2021-02-08', 1),
  (10, 'Eduardo Klein', 'eduardo@polocapital.com.br', '(11) 3055-8800', 'Edital', '2024-11-18', 1),
  (11, 'Marcos Dietrich', 'inovacao@weglabs.net', '(47) 3276-4000', 'Edital', '2023-03-07', 1),
  (12, 'Bruna Hass', 'bruna.hass@tramatextil.com', '(47) 98801-6650', 'Edital', '2025-01-14', 1);

INSERT INTO contato_empresa (contato_id, empresa_id, papel, principal, inicio) VALUES
  (1, 1, 'CEO', TRUE, '2025-03-12'),
  (2, 2, 'Ponto focal', TRUE, '2023-08-01'),
  (3, 3, 'Sócio-fundador', TRUE, '2024-02-20'),
  (4, 4, 'CEO', TRUE, '2025-06-03'),
  (5, 5, 'Sócio-fundador', TRUE, '2026-04-10'),
  (6, 6, 'Sócio-fundador', TRUE, '2025-09-22'),
  (7, 7, 'Ponto focal', TRUE, '2026-10-02'),
  (8, 8, 'Ponto focal', TRUE, '2022-05-30'),
  (9, 9, 'CEO', TRUE, '2021-02-08'),
  (10, 10, 'Sócio-fundador', TRUE, '2024-11-18'),
  (11, 11, 'Ponto focal', TRUE, '2023-03-07'),
  (12, 12, 'Sócio-fundador', TRUE, '2025-01-14');

-- Interações: a mais recente de cada empresa define os "dias sem interação" da listagem
INSERT INTO interacoes (empresa_id, usuario_id, tipo, data, resumo, privada) VALUES
  (1, 1, 'Reunião de acompanhamento', CURRENT_DATE - INTERVAL 3 DAY + INTERVAL 10 HOUR, 'Revisão das metas do trimestre. A empresa fechou um piloto com um cliente industrial e vai contratar 2 pessoas.', FALSE),
  (1, 2, 'Negociação de aporte', CURRENT_DATE - INTERVAL 9 DAY + INTERVAL 15 HOUR, 'Conversa com um fundo parceiro sobre aporte de R$ 300 mil. Valores e termos sob sigilo.', TRUE),
  (1, 3, 'Mentoria de pitch', CURRENT_DATE - INTERVAL 12 DAY + INTERVAL 14 HOUR, 'Preparação para o Demo Day. Ajustar o slide de mercado e tração.', FALSE),
  (2, 3, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 1 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Daniela Weiss.', FALSE),
  (3, 1, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 37 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Rodrigo Alves.', FALSE),
  (4, 4, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 61 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Ana Beatriz Costa.', FALSE),
  (5, 3, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 33 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Thiago Brandt.', FALSE),
  (6, 3, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 42 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Juliana Prates.', FALSE),
  (7, 4, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 8 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Sérgio Lenz.', FALSE),
  (8, 2, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 12 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Helena Rocha.', FALSE),
  (9, 1, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 150 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Paula Nunes.', FALSE),
  (10, 2, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 20 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Eduardo Klein.', FALSE),
  (11, 2, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 4 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Marcos Dietrich.', FALSE),
  (12, 4, 'Acompanhamento mensal', CURRENT_DATE - INTERVAL 270 DAY + INTERVAL 10 HOUR, 'Acompanhamento de rotina com Bruna Hass.', FALSE);

-- Vínculos vigentes das empresas pré-incubadas, incubadas e residentes
INSERT INTO vinculos (empresa_id, modalidade, fase, inicio, fim_previsto, fim_real, espaco, motivo_saida) VALUES
  (1, 'Incubação', '', '2025-03-12', '2025-03-12' + INTERVAL 3 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (2, 'Residência', '', '2023-08-01', '2023-08-01' + INTERVAL 5 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (3, 'Residência', '', '2024-02-20', '2024-02-20' + INTERVAL 5 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (4, 'Incubação', '', '2025-06-03', '2025-06-03' + INTERVAL 3 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (5, 'Pré-incubação', '', '2026-04-10', '2026-04-10' + INTERVAL 1 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (6, 'Incubação', '', '2025-09-22', '2025-09-22' + INTERVAL 3 YEAR, NULL, 'Inovaparq, bloco B', NULL),
  (12, 'Pré-incubação', '', '2025-01-14', '2025-01-14' + INTERVAL 1 YEAR, '2025-08-20', 'Inovaparq, bloco B', 'Desistiu do programa');

-- Programa, evento e oportunidade de exemplo
INSERT INTO programas (id, nome, edital, inscricoes_ate, vagas, status) VALUES
  (1, 'Incubação 2027', 'Edital 01/2027', CURRENT_DATE + INTERVAL 45 DAY, 8, 'Inscrições abertas');

INSERT INTO eventos (id, nome, tipo, inicio, fim, local, capacidade, publico, programa_id, criado_por) VALUES
  (1, 'Demo Day Inovaparq', 'Demo day', CURRENT_DATE + INTERVAL 20 DAY + INTERVAL 14 HOUR, CURRENT_DATE + INTERVAL 20 DAY + INTERVAL 18 HOUR, 'Auditório do Inovaparq', 120, 'Aberto', NULL, 3);

INSERT INTO participacoes (evento_id, contato_id, empresa_id, status) VALUES
  (1, 1, 1, 'Confirmado'),
  (1, 6, 6, 'Inscrito');

INSERT INTO candidaturas (programa_id, empresa_id, resultado) VALUES
  (1, 7, 'Em avaliação');

INSERT INTO oportunidades (titulo, tipo, empresa_id, contato_principal_id, responsavel_id, etapa, valor_estimado, data_prevista, criado_por) VALUES
  ('Aporte semente da Nexa Sensores', 'Investimento', 1, 1, 2, 'Negociação', 300000.00, CURRENT_DATE + INTERVAL 60 DAY, 2),
  ('Incubação da LTD', 'Nova incubação', 7, 7, 4, 'Qualificada', NULL, CURRENT_DATE + INTERVAL 45 DAY, 4);

INSERT INTO tarefas (titulo, prazo, responsavel_id, empresa_id) VALUES
  ('Enviar minuta do termo de aporte', CURRENT_DATE + INTERVAL 5 DAY, 2, 1),
  ('Agendar visita à LTD', CURRENT_DATE + INTERVAL 2 DAY, 4, 7);

INSERT INTO indicadores (empresa_id, periodo, faturamento, empregos, clientes, captacao, propriedade_intelectual) VALUES
  (1, DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m'), 48000.00, 7, 3, 0, 1),
  (2, DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m'), 210000.00, 23, 41, 0, 2);
