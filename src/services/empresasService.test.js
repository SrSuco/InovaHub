import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPRESAS_INICIAIS } from '../data/empresas.js';
import {
  ErroValidacao,
  atualizarEmpresa,
  consultarCep,
  criarEmpresa,
  desativarEmpresa,
  listarEmpresas,
  reativarEmpresa,
  restaurarBaseDemonstracao,
} from './empresasService.js';
import * as servico from './empresasService.js';

vi.mock('./armazenamento.js', async (original) => ({ ...(await original()), aguardar: () => Promise.resolve() }));

const nova = {
  cnpj: '11.222.333/0001-81',
  razaoSocial: 'Aurora Biotecnologia Ltda.',
  nomeFantasia: 'Aurora Bio',
  categoria: 'Prospect',
  setor: 'Saúde',
  responsavelId: 'u3',
  contatoNome: 'Fernanda Lima',
  email: 'fernanda@aurorabio.com.br',
  telefone: '(47) 99912-0000',
  cidade: 'Joinville',
};

beforeEach(() => restaurarBaseDemonstracao());

describe('empresasService', () => {
  it('cria empresa ativa com datas de controle', async () => {
    const criada = await criarEmpresa(nova);
    expect(criada).toMatchObject({ situacao: 'Ativa', nomeFantasia: 'Aurora Bio' });
    expect(criada.criadoEm).toBeTruthy();
    expect(await listarEmpresas()).toHaveLength(EMPRESAS_INICIAIS.length + 1);
  });

  it('recusa CNPJ já cadastrado, avisando quando a empresa está desativada', async () => {
    await expect(criarEmpresa({ ...nova, cnpj: '52601815000120' })).rejects.toMatchObject({
      campos: { cnpj: 'Este CNPJ já está cadastrado para Nexa Sensores.' },
    });
    const desativada = EMPRESAS_INICIAIS.find((e) => e.situacao === 'Desativada');
    await expect(criarEmpresa({ ...nova, cnpj: desativada.cnpj })).rejects.toBeInstanceOf(ErroValidacao);
    await expect(criarEmpresa({ ...nova, cnpj: desativada.cnpj })).rejects.toMatchObject({
      campos: { cnpj: expect.stringContaining('reative o cadastro') },
    });
  });

  it('não deixa alterar o CNPJ na edição', async () => {
    const atualizada = await atualizarEmpresa('e1', { razaoSocial: 'Nexa Sensores S.A.', cnpj: '00.000.000/0000-00' });
    expect(atualizada.cnpj).toBe('52.601.815/0001-20');
    expect(atualizada.razaoSocial).toBe('Nexa Sensores S.A.');
  });

  it('desativa e reativa sem excluir a empresa', async () => {
    await desativarEmpresa('e1', { motivo: 'Encerrou as atividades', dataSaida: '2026-11-11' });
    let empresas = await listarEmpresas();
    expect(empresas).toHaveLength(EMPRESAS_INICIAIS.length);
    expect(empresas.find((e) => e.id === 'e1')).toMatchObject({
      situacao: 'Desativada',
      desativacao: { motivo: 'Encerrou as atividades' },
    });
    await expect(atualizarEmpresa('e1', {})).rejects.toThrow('Reative');

    await reativarEmpresa('e1');
    empresas = await listarEmpresas();
    expect(empresas.find((e) => e.id === 'e1')).toMatchObject({ situacao: 'Ativa', desativacao: null });
  });

  it('exige motivo para desativar', async () => {
    await expect(desativarEmpresa('e1', { motivo: '' })).rejects.toBeInstanceOf(ErroValidacao);
  });

  it('não oferece nenhuma função de exclusão', () => {
    expect(Object.keys(servico).some((nome) => /exclu|remov|delet|apag/i.test(nome))).toBe(false);
  });

  it('consulta o CEP na base simulada', async () => {
    expect(await consultarCep('89219-710')).toMatchObject({ cidade: 'Joinville', uf: 'SC' });
    await expect(consultarCep('00000-000')).rejects.toThrow('CEP não encontrado');
  });
});
