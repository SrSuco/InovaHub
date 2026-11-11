/**
 * Pequeno invólucro sobre o localStorage, usado pelos serviços simulados.
 * Se o navegador bloquear o armazenamento, os dados ficam só em memória.
 */
const PREFIXO = 'inovahub:';
const memoria = new Map();

function disponivel() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function ler(chave, padrao) {
  try {
    if (disponivel()) {
      const valor = localStorage.getItem(PREFIXO + chave);
      return valor === null ? padrao : JSON.parse(valor);
    }
  } catch {
    /* segue para a memória */
  }
  return memoria.has(chave) ? memoria.get(chave) : padrao;
}

export function gravar(chave, valor) {
  memoria.set(chave, valor);
  try {
    if (disponivel()) localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* mantém só em memória */
  }
}

export function remover(chave) {
  memoria.delete(chave);
  try {
    if (disponivel()) localStorage.removeItem(PREFIXO + chave);
  } catch {
    /* nada a fazer */
  }
}

/** Simula a latência de uma chamada de rede. */
export const aguardar = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
