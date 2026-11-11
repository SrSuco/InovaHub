/** Converte "AAAA-MM-DD" (ou data e hora ISO) para "dd/mm/aaaa". */
export function formatarData(valor) {
  if (!valor) return '';
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : '';
}
