import { somenteDigitos } from './validacao.js';

/** Aplica um padrão em que "#" representa um dígito. Ex.: aplicar('12345', '##-###') → '12-345'. */
function aplicar(valor, padrao) {
  const digitos = somenteDigitos(valor);
  let resultado = '';
  let i = 0;
  for (const caractere of padrao) {
    if (i >= digitos.length) break;
    if (caractere === '#') {
      resultado += digitos[i];
      i += 1;
    } else {
      resultado += caractere;
    }
  }
  return resultado;
}

export const mascararCnpj = (valor) => aplicar(valor, '##.###.###/####-##');
export const mascararCep = (valor) => aplicar(valor, '#####-###');

export function mascararTelefone(valor) {
  const digitos = somenteDigitos(valor);
  return digitos.length > 10 ? aplicar(digitos, '(##) #####-####') : aplicar(digitos, '(##) ####-####');
}
