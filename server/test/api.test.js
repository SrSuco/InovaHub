import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarBanco } from '../scripts/criar-banco.js';
import { criarApp } from '../src/app.js';
import { consultar, pool } from '../src/db.js';

/**
 * Testes de integração: sobem a API de verdade contra um MySQL de teste.
 * Se não houver MySQL acessível (veja .env), os testes são pulados.
 */
let bancoDisponivel = true;
try {
  await criarBanco();
} catch (erro) {
  bancoDisponivel = false;
  console.warn(`MySQL indisponível (${erro.code ?? erro.message}); testes de integração pulados.`);
}

const app = criarApp();
const NOVA = {
  cnpj: '11.222.333/0001-81',
  razaoSocial: 'Aurora Biotecnologia Ltda.',
  nomeFantasia: 'Aurora Bio',
  porte: 'Microempresa (ME)',
  categoria: 'Prospect',
  setor: 'Saúde',
  responsavelId: '3',
  contatoNome: 'Ana Souza',
  email: 'ana@aurorabio.com.br',
  telefone: '(47) 99999-0000',
  cidade: 'Joinville',
  uf: 'sc',
};

async function entrar(identificador, senha = 'inovahub') {
  const resposta = await request(app).post('/api/auth/login').send({ identificador, senha });
  return resposta.body.token;
}
const comToken = (token) => ({ Authorization: `Bearer ${token}` });

describe.skipIf(!bancoDisponivel)('API com MySQL', () => {
  const tokens = {};

  beforeAll(async () => {
    for (const login of ['admin', 'gerencia', 'analista', 'consulta']) tokens[login] = await entrar(login);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('saúde e autenticação', () => {
    it('responde que o banco está conectado', async () => {
      const resposta = await request(app).get('/api/saude');
      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual({ status: 'ok', banco: 'conectado' });
    });

    it('entra com login ou e-mail e devolve usuário, token e matriz', async () => {
      const resposta = await request(app)
        .post('/api/auth/login')
        .send({ identificador: 'Marina.K@inovaparq.univille.br', senha: 'inovahub' });
      expect(resposta.status).toBe(200);
      expect(resposta.body.usuario).toMatchObject({ login: 'analista', perfil: 'Analista', ultimoAcesso: 'agora' });
      expect(resposta.body.usuario.senha_hash).toBeUndefined();
      expect(resposta.body.matriz.Analista.empresas).toBe('VCE');
      expect(resposta.body.token).toBeTruthy();
    });

    it.each([
      ['admin', 'senha-errada'],
      ['beatriz', 'inovahub'], // convite pendente
      ['joao', 'inovahub'], // desativado
      ["' OR '1'='1", "' OR '1'='1"],
    ])('recusa %s com mensagem genérica', async (identificador, senha) => {
      const resposta = await request(app).post('/api/auth/login').send({ identificador, senha });
      expect(resposta.status).toBe(401);
      expect(resposta.body.mensagem).toBe('Usuário ou senha incorretos.');
    });

    it('exige token nas rotas protegidas', async () => {
      expect((await request(app).get('/api/empresas')).status).toBe(401);
      expect((await request(app).get('/api/empresas').set(comToken('token-falso'))).status).toBe(401);
    });

    it('recupera a sessão a partir do token', async () => {
      const resposta = await request(app).get('/api/auth/sessao').set(comToken(tokens.gerencia));
      expect(resposta.status).toBe(200);
      expect(resposta.body.usuario.perfil).toBe('Gerência');
    });
  });

  describe('empresas', () => {
    it('lista as 12 empresas do protótipo, inclusive as desativadas', async () => {
      const resposta = await request(app).get('/api/empresas').set(comToken(tokens.consulta));
      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(12);
      const cria = resposta.body.find((e) => e.nomeFantasia === 'Cria Educação');
      expect(cria.situacao).toBe('Desativada');
      expect(cria.desativacao).toMatchObject({ motivo: 'Graduou e saiu do parque', dataSaida: '2026-06-30' });
      const nexa = resposta.body.find((e) => e.id === '1');
      expect(nexa).toMatchObject({ cnpj: '52.601.815/0001-20', diasSemInteracao: 3, responsavelId: '1' });
    });

    it('devolve 404 para empresa inexistente', async () => {
      const resposta = await request(app).get('/api/empresas/999').set(comToken(tokens.analista));
      expect(resposta.status).toBe(404);
      expect(resposta.body.mensagem).toBe('Empresa não encontrada.');
    });

    it('não deixa o perfil Consulta cadastrar', async () => {
      const resposta = await request(app).post('/api/empresas').set(comToken(tokens.consulta)).send(NOVA);
      expect(resposta.status).toBe(403);
    });

    it('devolve os erros de cada campo com as mensagens do formulário', async () => {
      const resposta = await request(app)
        .post('/api/empresas')
        .set(comToken(tokens.analista))
        .send({ cnpj: '11.111.111/1111-11', email: 'sem-arroba', site: 'empresa' });
      expect(resposta.status).toBe(422);
      expect(resposta.body.campos).toMatchObject({
        cnpj: 'CNPJ inválido. Confira os 14 dígitos.',
        email: 'E-mail inválido. Use o formato nome@empresa.com.br.',
        site: 'Use o endereço completo, como https://empresa.com.br.',
        razaoSocial: expect.any(String),
        categoria: expect.any(String),
      });
    });

    it('recusa CNPJ já cadastrado, com ou sem pontuação', async () => {
      const resposta = await request(app)
        .post('/api/empresas')
        .set(comToken(tokens.analista))
        .send({ ...NOVA, cnpj: '52601815000120' });
      expect(resposta.status).toBe(422);
      expect(resposta.body.campos.cnpj).toBe('Este CNPJ já está cadastrado para Nexa Sensores.');
    });

    it('sugere reativar quando o CNPJ é de uma empresa desativada', async () => {
      const lista = (await request(app).get('/api/empresas').set(comToken(tokens.analista))).body;
      const trama = lista.find((e) => e.nomeFantasia === 'Trama Têxtil');
      const resposta = await request(app)
        .post('/api/empresas')
        .set(comToken(tokens.analista))
        .send({ ...NOVA, cnpj: trama.cnpj });
      expect(resposta.body.campos.cnpj).toMatch(/reative o cadastro/);
    });

    let novaId;
    it('cadastra empresa e guarda o CNPJ só com dígitos', async () => {
      const resposta = await request(app).post('/api/empresas').set(comToken(tokens.analista)).send(NOVA);
      expect(resposta.status).toBe(201);
      expect(resposta.body).toMatchObject({ cnpj: '11.222.333/0001-81', situacao: 'Ativa', uf: 'SC', desativacao: null });
      novaId = resposta.body.id;
      const [linha] = await consultar('SELECT cnpj, criado_por FROM empresas WHERE id = ?', [novaId]);
      expect(linha).toEqual({ cnpj: '11222333000181', criado_por: 3 });
    });

    it('edita sem alterar o CNPJ', async () => {
      const resposta = await request(app)
        .put(`/api/empresas/${novaId}`)
        .set(comToken(tokens.analista))
        .send({ ...NOVA, cnpj: '52.601.815/0001-20', categoria: 'Pré-incubada' });
      expect(resposta.status).toBe(200);
      expect(resposta.body).toMatchObject({ categoria: 'Pré-incubada', cnpj: '11.222.333/0001-81' });
    });

    it('só desativa com permissão, motivo e data', async () => {
      const semPermissao = await request(app)
        .post(`/api/empresas/${novaId}/desativar`)
        .set(comToken(tokens.analista))
        .send({ motivo: 'Outro motivo', dataSaida: '2026-11-11' });
      expect(semPermissao.status).toBe(403);

      const semMotivo = await request(app).post(`/api/empresas/${novaId}/desativar`).set(comToken(tokens.gerencia)).send({});
      expect(semMotivo.status).toBe(422);
      expect(semMotivo.body.campos).toHaveProperty('motivo');
    });

    it('desativa, bloqueia a edição e reativa mantendo o histórico', async () => {
      const desativada = await request(app)
        .post(`/api/empresas/${novaId}/desativar`)
        .set(comToken(tokens.gerencia))
        .send({ motivo: 'Desistiu do programa', dataSaida: '2026-11-11', observacao: 'Teste' });
      expect(desativada.status).toBe(200);
      expect(desativada.body).toMatchObject({
        situacao: 'Desativada',
        desativacao: { motivo: 'Desistiu do programa', dataSaida: '2026-11-11', observacao: 'Teste' },
      });

      const edicao = await request(app).put(`/api/empresas/${novaId}`).set(comToken(tokens.analista)).send(NOVA);
      expect(edicao.status).toBe(409);

      const reativada = await request(app).post(`/api/empresas/${novaId}/reativar`).set(comToken(tokens.gerencia));
      expect(reativada.body).toMatchObject({ situacao: 'Ativa', desativacao: null });

      await request(app)
        .post(`/api/empresas/${novaId}/desativar`)
        .set(comToken(tokens.admin))
        .send({ motivo: 'Outro motivo', dataSaida: '2026-11-12' });
      const historico = await consultar(
        'SELECT motivo, reativado_em IS NOT NULL AS reativada FROM empresa_desativacoes WHERE empresa_id = ? ORDER BY id',
        [novaId],
      );
      expect(historico).toEqual([
        { motivo: 'Desistiu do programa', reativada: 1 },
        { motivo: 'Outro motivo', reativada: 0 },
      ]);
    });

    it('não oferece exclusão de empresa', async () => {
      const resposta = await request(app).delete(`/api/empresas/${novaId}`).set(comToken(tokens.admin));
      expect(resposta.status).toBe(404);
      const [linha] = await consultar('SELECT COUNT(*) AS total FROM empresas WHERE id = ?', [novaId]);
      expect(linha.total).toBe(1);
    });
  });

  describe('usuários e permissões', () => {
    it('lista responsáveis para qualquer perfil logado', async () => {
      const resposta = await request(app).get('/api/usuarios/responsaveis').set(comToken(tokens.consulta));
      expect(resposta.status).toBe(200);
      expect(resposta.body.map((u) => u.login).sort()).toEqual(['admin', 'analista', 'gerencia', 'rafael']);
    });

    it('só o Administrador gerencia usuários', async () => {
      expect((await request(app).get('/api/usuarios').set(comToken(tokens.gerencia))).status).toBe(403);
      expect((await request(app).get('/api/usuarios').set(comToken(tokens.admin))).body).toHaveLength(7);
    });

    it('cria usuário com senha temporária, que já consegue entrar', async () => {
      const resposta = await request(app).post('/api/usuarios').set(comToken(tokens.admin)).send({
        nome: 'Paula Ribeiro',
        email: 'Paula.R@inovaparq.univille.br',
        perfil: 'Analista',
        vinculo: 'Equipe do parque',
        primeiroAcesso: 'senha',
        senhaTemporaria: 'temporaria1',
      });
      expect(resposta.status).toBe(201);
      expect(resposta.body).toMatchObject({ login: 'paula.r', email: 'paula.r@inovaparq.univille.br', situacao: 'Ativo' });
      expect(await entrar('paula.r', 'temporaria1')).toBeTruthy();
    });

    it('recusa e-mail repetido', async () => {
      const resposta = await request(app).post('/api/usuarios').set(comToken(tokens.admin)).send({
        nome: 'Outra Pessoa',
        email: 'marina.k@inovaparq.univille.br',
        perfil: 'Consulta',
        primeiroAcesso: 'convite',
      });
      expect(resposta.status).toBe(422);
      expect(resposta.body.campos.email).toBe('Já existe um usuário com este e-mail.');
    });

    it('troca a própria senha conferindo a atual', async () => {
      const token = await entrar('paula.r', 'temporaria1');
      const errada = await request(app)
        .put('/api/auth/senha')
        .set(comToken(token))
        .send({ atual: 'xxxxxxxx1', nova: 'parque2026', confirmacao: 'parque2026' });
      expect(errada.status).toBe(422);
      expect(errada.body.campos.atual).toBe('A senha atual não confere.');

      const certa = await request(app)
        .put('/api/auth/senha')
        .set(comToken(token))
        .send({ atual: 'temporaria1', nova: 'parque2026', confirmacao: 'parque2026' });
      expect(certa.status).toBe(204);
      expect(await entrar('paula.r', 'parque2026')).toBeTruthy();
    });

    it('usuário desativado perde o acesso na hora', async () => {
      const token = await entrar('paula.r', 'parque2026');
      const lista = (await request(app).get('/api/usuarios').set(comToken(tokens.admin))).body;
      const paula = lista.find((u) => u.login === 'paula.r');
      await request(app).patch(`/api/usuarios/${paula.id}/situacao`).set(comToken(tokens.admin)).send({ situacao: 'Desativado' });
      expect((await request(app).get('/api/empresas').set(comToken(token))).status).toBe(401);
    });

    it('grava a matriz de permissões e aplica na hora', async () => {
      expect((await request(app).put('/api/permissoes').set(comToken(tokens.gerencia)).send({})).status).toBe(403);

      const matriz = (await request(app).get('/api/permissoes').set(comToken(tokens.admin))).body;
      matriz.Consulta.empresas = 'VCX';
      matriz.Administrador.empresas = '';
      const salva = await request(app).put('/api/permissoes').set(comToken(tokens.admin)).send(matriz);
      expect(salva.status).toBe(200);
      expect(salva.body.Consulta.empresas).toBe('VC');
      expect(salva.body.Administrador.empresas).toBe('VCEDP');

      const criada = await request(app)
        .post('/api/empresas')
        .set(comToken(tokens.consulta))
        .send({ ...NOVA, cnpj: '45.723.174/0001-10', razaoSocial: 'Empresa da Consulta Ltda.' });
      expect(criada.status).toBe(201);
    });
  });
});
