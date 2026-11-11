import { somenteDigitos } from '../validacao.js';

/** 52601815000120 → 52.601.815/0001-20 */
export function formatarCnpj(digitos) {
  const d = somenteDigitos(digitos);
  if (d.length !== 14) return d;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/** "2025-03-12 09:00:00" → "2025-03-12T09:00:00" (formato usado pelas telas). */
export const dataHoraIso = (valor) => (valor ? String(valor).replace(' ', 'T') : '');

/** Texto curto para "último acesso", como nas telas: "agora", "há 2 h", "ontem". */
export function tempoRelativo(valor, agora = new Date()) {
  if (!valor) return '—';
  const data = valor instanceof Date ? valor : new Date(String(valor).replace(' ', 'T'));
  const minutos = Math.floor((agora - data) / 60000);
  if (minutos < 5) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
}

/** Converte "" em null para colunas DATE opcionais. */
export const dataOuNulo = (valor) => (valor ? String(valor).slice(0, 10) : null);
