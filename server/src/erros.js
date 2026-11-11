/** Erros com status HTTP, tratados pelo middleware de erros. */
export class ErroHttp extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    if (campos) this.campos = campos;
  }
}

export const naoEncontrado = (mensagem = 'Registro não encontrado.') => new ErroHttp(404, mensagem);

export const erroValidacao = (campos, mensagem = 'Não foi possível salvar. Corrija os campos destacados.') =>
  new ErroHttp(422, mensagem, campos);
