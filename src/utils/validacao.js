/** Funções de validação reutilizáveis. Todas recebem o valor bruto e devolvem true/false. */

export const somenteDigitos = (valor = '') => String(valor).replace(/\D/g, '');

/** Valida CNPJ conferindo os dois dígitos verificadores. */
export function cnpjValido(valor) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcularDigito = (base) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((total, digito, i) => total + Number(digito) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiro = calcularDigito(cnpj.slice(0, 12));
  const segundo = calcularDigito(cnpj.slice(0, 12) + primeiro);
  return cnpj.endsWith(`${primeiro}${segundo}`);
}

export const emailValido = (valor = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor).trim());

/** Telefone brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular). */
export function telefoneValido(valor) {
  const digitos = somenteDigitos(valor);
  return digitos.length === 10 || (digitos.length === 11 && digitos[2] === '9');
}

export const cepValido = (valor) => somenteDigitos(valor).length === 8;

export function urlValida(valor = '') {
  try {
    const url = new URL(String(valor).trim());
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

/** Data no formato AAAA-MM-DD que não esteja no futuro. */
export function dataNaoFutura(valor, hoje = new Date()) {
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return false;
  const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return data <= limite;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
