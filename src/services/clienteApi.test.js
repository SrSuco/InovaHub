import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErroApi, api, definirToken, usaApi } from './clienteApi.js';

const resposta = (status, corpo) => ({ ok: status < 400, status, json: () => Promise.resolve(corpo) });

afterEach(() => {
  vi.unstubAllGlobals();
  definirToken(null);
});

describe('clienteApi', () => {
  it('fica no modo demonstração sem VITE_API_URL', () => {
    expect(usaApi).toBe(false);
  });

  it('envia JSON e o token no cabeçalho', async () => {
    const fetch = vi.fn().mockResolvedValue(resposta(200, { ok: true }));
    vi.stubGlobal('fetch', fetch);
    definirToken('abc');
    expect(await api.post('/empresas', { nome: 'X' })).toEqual({ ok: true });
    const [, opcoes] = fetch.mock.calls[0];
    expect(opcoes.method).toBe('POST');
    expect(opcoes.headers).toMatchObject({ Authorization: 'Bearer abc', 'Content-Type': 'application/json' });
    expect(opcoes.body).toBe('{"nome":"X"}');
  });

  it('transforma a resposta de erro em ErroApi com os campos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resposta(422, { mensagem: 'Corrija', campos: { cnpj: 'Inválido' } })));
    const erro = await api.post('/empresas').catch((e) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro).toMatchObject({ status: 422, message: 'Corrija', campos: { cnpj: 'Inválido' } });
  });

  it('avisa quando o servidor está fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const erro = await api.get('/saude').catch((e) => e);
    expect(erro).toMatchObject({ status: 0, message: expect.stringMatching(/servidor/) });
  });

  it('devolve null em respostas sem corpo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    expect(await api.put('/auth/senha', {})).toBeNull();
  });
});
