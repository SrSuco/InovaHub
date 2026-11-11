/**
 * Converte uma cor HEX (#RRGGBB) para OKLCH, o formato usado pelas
 * variáveis de cor do DaisyUI 4 (--p, --pc...).
 */
export function hexParaOklch(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const linear = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const r = linear((n >> 16) & 255);
  const g = linear((n >> 8) & 255);
  const b = linear(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C: Math.hypot(A, B), H };
}

export const CORES_DESTAQUE = [
  { nome: 'InovaParq', hex: '#AB218E' },
  { nome: 'UNIVILLE', hex: '#00703C' },
  { nome: 'Azul', hex: '#2563EB' },
  { nome: 'Laranja', hex: '#EA580C' },
];
