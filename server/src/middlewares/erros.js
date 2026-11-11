import { ErroHttp } from '../erros.js';

export function rotaNaoEncontrada(req, _res, next) {
  next(new ErroHttp(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

/** Converte qualquer erro em uma resposta JSON { mensagem, campos? }. */
export function tratarErros(erro, _req, res, _next) {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ mensagem: erro.message, ...(erro.campos && { campos: erro.campos }) });
  }
  if (erro?.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
  }
  if (erro?.code === 'ECONNREFUSED' || erro?.code === 'ER_ACCESS_DENIED_ERROR' || erro?.code === 'ER_BAD_DB_ERROR') {
    console.error('[banco]', erro.code, erro.message);
    return res.status(503).json({ mensagem: 'Banco de dados indisponível. Tente de novo em instantes.' });
  }
  console.error(erro);
  return res.status(500).json({ mensagem: 'Erro inesperado no servidor.' });
}
