/**
 * A API usa as mesmas regras de validação das telas, para que a mensagem
 * mostrada ao usuário seja igual nos dois lados.
 */
export { validarEmpresa } from '../../src/pages/empresas/validacaoEmpresa.js';
export { validarUsuario, VINCULOS } from '../../src/pages/usuarios/validacaoUsuario.js';
export { validarNovaSenha } from '../../src/pages/perfil/validacaoSenha.js';
export { CATEGORIAS, SETORES, PORTES, MOTIVOS_DESATIVACAO } from '../../src/data/opcoesEmpresa.js';
export { ADMINISTRADOR, MODULOS, PERFIS } from '../../src/data/permissoes.js';
export { cnpjValido, somenteDigitos } from '../../src/utils/validacao.js';
