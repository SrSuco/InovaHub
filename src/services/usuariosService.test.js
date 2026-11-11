import { describe, expect, it, vi } from 'vitest';
import { MATRIZ_PADRAO } from '../data/permissoes.js';
import { alterarSenha, autenticar, responsaveisDisponiveis, salvarUsuario } from './usuariosService.js';

vi.mock('./armazenamento.js', async (original) => ({ ...(await original()), aguardar: () => Promise.resolve() }));

describe('usuariosService no modo demonstração', () => {
  it('autentica e devolve usuário, matriz e nenhum token', async () => {
    const sessao = await autenticar('analista', 'inovahub');
    expect(sessao.usuario.login).toBe('analista');
    expect(sessao.matriz).toEqual(MATRIZ_PADRAO);
    expect(sessao.token).toBeNull();
  });

  it('recusa senha errada e usuário com convite pendente', async () => {
    await expect(autenticar('admin', 'errada')).rejects.toThrow('Usuário ou senha incorretos.');
    await expect(autenticar('beatriz', 'inovahub')).rejects.toThrow('Usuário ou senha incorretos.');
  });

  it('lista só a equipe ativa como responsável', async () => {
    const lista = await responsaveisDisponiveis();
    expect(lista.map((u) => u.login)).toEqual(['admin', 'gerencia', 'analista', 'rafael']);
  });

  it('cria usuário ativo quando recebe senha temporária', async () => {
    const novo = await salvarUsuario({
      nome: 'Paula Ribeiro',
      email: 'paula.r@inovaparq.univille.br',
      perfil: 'Analista',
      primeiroAcesso: 'senha',
      senhaTemporaria: 'temporaria1',
    });
    expect(novo).toMatchObject({ situacao: 'Ativo', login: 'paula.r' });
    expect(novo).not.toHaveProperty('senhaTemporaria');
  });

  it('confere a senha atual antes de trocar', async () => {
    await expect(alterarSenha({ atual: 'errada', nova: 'parque2026' })).rejects.toMatchObject({
      campos: { atual: 'A senha atual não confere.' },
    });
    await expect(alterarSenha({ atual: 'inovahub', nova: 'parque2026' })).resolves.toBeNull();
  });
});
