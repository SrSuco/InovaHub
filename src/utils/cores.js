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

/** Converte OKLCH para RGB linear (sem limitar ao gamut sRGB). */
function oklchParaRgbLinear(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const dentroDoGamut = (rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** Reduz o croma até a cor caber no sRGB, mantendo luminosidade e matiz. */
function ajustarAoGamut(L, C, H) {
  if (dentroDoGamut(oklchParaRgbLinear(L, C, H))) return C;
  let min = 0;
  let max = C;
  for (let i = 0; i < 24; i += 1) {
    const meio = (min + max) / 2;
    if (dentroDoGamut(oklchParaRgbLinear(L, meio, H))) min = meio;
    else max = meio;
  }
  return min;
}

const paraGama = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const paraLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** Cor OKLCH em sRGB com gama (0 a 1 por canal). */
function oklchParaSrgb(L, C, H) {
  return oklchParaRgbLinear(L, C, H).map((c) => paraGama(Math.min(1, Math.max(0, c))));
}

/** Luminância relativa (WCAG) de uma cor sRGB com gama. */
function luminanciaSrgb([r, g, b]) {
  return 0.2126 * paraLinear(r) + 0.7152 * paraLinear(g) + 0.0722 * paraLinear(b);
}

/** Luminância relativa (WCAG) de uma cor OKLCH. */
function luminanciaOklch(L, C, H) {
  return luminanciaSrgb(oklchParaSrgb(L, C, H));
}

/** Cor HEX em sRGB com gama (0 a 1 por canal). */
function hexParaSrgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

/** Luminância relativa (WCAG) de uma cor HEX. */
export function luminanciaHex(hex) {
  return luminanciaSrgb(hexParaSrgb(hex));
}

/** Razão de contraste WCAG entre duas luminâncias relativas. */
export function razaoContraste(lum1, lum2) {
  const [clara, escura] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
  return (clara + 0.05) / (escura + 0.05);
}

/** Fundo dos cartões (base-100) em cada modo, igual ao tailwind.config.js. */
export const FUNDO_CLARO = '#ffffff';
export const FUNDO_ESCURO = '#1c1720';

/** Contraste mínimo buscado, com folga sobre os 4,5:1 da WCAG AA. */
export const CONTRASTE_MINIMO = 4.8;

/**
 * Calcula as variáveis --p e --pc do DaisyUI para a cor de destaque.
 * A luminosidade é ajustada até a cor ter contraste suficiente tanto com o
 * fundo da página (links e textos em destaque) quanto com o texto sobre ela
 * (botões e selos). Devolve também os contrastes obtidos.
 */
export function variaveisDestaque(hex, escuro) {
  const original = hexParaOklch(hex);
  const H = original.H;
  const fundoSrgb = hexParaSrgb(escuro ? FUNDO_ESCURO : FUNDO_CLARO);
  const fundo = luminanciaSrgb(fundoSrgb);
  // No modo claro o texto sobre o destaque é branco; no escuro, quase preto.
  const textoL = escuro ? 0.18 : 0.99;
  const textoC = escuro ? 0.02 : 0;
  const texto = luminanciaOklch(textoL, textoC, H);
  const passo = escuro ? 0.005 : -0.005;

  let L = escuro ? Math.max(original.L, 0.62) : original.L;
  let C = ajustarAoGamut(L, original.C, H);
  const atende = () => {
    const srgb = oklchParaSrgb(L, C, H);
    const cor = luminanciaSrgb(srgb);
    // O item ativo do menu usa o destaque a 12% sobre o fundo (ver index.css).
    const fundoItemAtivo = luminanciaSrgb(fundoSrgb.map((f, i) => f * 0.88 + srgb[i] * 0.12));
    return (
      razaoContraste(cor, fundo) >= CONTRASTE_MINIMO &&
      razaoContraste(cor, fundoItemAtivo) >= CONTRASTE_MINIMO &&
      razaoContraste(cor, texto) >= CONTRASTE_MINIMO
    );
  };
  while (!atende() && L > 0.2 && L < 0.95) {
    L += passo;
    C = ajustarAoGamut(L, original.C, H);
  }

  const cor = luminanciaOklch(L, C, H);
  return {
    p: `${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}`,
    pc: `${textoL * 100}% ${textoC} ${H.toFixed(0)}`,
    contrasteFundo: razaoContraste(cor, fundo),
    contrasteTexto: razaoContraste(cor, texto),
  };
}
