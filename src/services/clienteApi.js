/**
 * Cliente HTTP da API do InovaHub.
 *
 * Com VITE_API_URL definida (ex.: "/api"), os serviços falam com a API e o
 * banco MySQL. Sem ela, continuam no modo demonstração, com os dados no
 * navegador. As telas não precisam saber em qual modo estão.
 */
export const URL_API = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');
export const usaApi = Boolean(URL_API);

/** Disparado quando a API recusa o token (sessão expirada ou usuário desativado). */
export const EVENTO_SESSAO_EXPIRADA = 'inovahub:sessao-expirada';

let token = null;

export function definirToken(novo) {
  token = novo || null;
}

/** Erro devolvido pela API, com o status HTTP e os erros por campo, se houver. */
export class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    if (campos) this.campos = campos;
  }
}

export async function requisitar(metodo, caminho, corpo) {
  let resposta;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi(0, 'Não foi possível falar com o servidor. Confira sua conexão.');
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));
  if (resposta.ok) return dados;

  if (resposta.status === 401 && token && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  }
  throw new ErroApi(resposta.status, dados.mensagem ?? `Erro ${resposta.status} ao falar com o servidor.`, dados.campos);
}

export const api = {
  get: (caminho) => requisitar('GET', caminho),
  post: (caminho, corpo = {}) => requisitar('POST', caminho, corpo),
  put: (caminho, corpo = {}) => requisitar('PUT', caminho, corpo),
  patch: (caminho, corpo = {}) => requisitar('PATCH', caminho, corpo),
};
