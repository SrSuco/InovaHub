/** Repassa erros de funções assíncronas para o middleware de erros do Express 4. */
export const rota = (funcao) => (req, res, next) => Promise.resolve(funcao(req, res, next)).catch(next);
