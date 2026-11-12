/**
 * Símbolo do InovaHub: quadrado na cor de destaque com as letras "ih" vazadas.
 * Usa a cor primária do tema, então acompanha a troca de cor e o modo escuro.
 */
export function Simbolo({ className = 'w-9 h-9', inverso = false }) {
  const fundo = inverso ? 'fill-primary-content' : 'fill-primary';
  const letras = inverso ? 'text-primary' : 'text-primary-content';
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 120 120" role="img" aria-label="InovaHub">
      <rect className={fundo} width="120" height="120" rx="12" />
      <g className={letras}>
        <rect x="30" y="46" width="10" height="48" fill="currentColor" />
        <rect x="50" y="18" width="10" height="76" fill="currentColor" />
        <path d="M55 94V68c0-11 7-17 15-17s15 6 15 17v26" stroke="currentColor" strokeWidth="10" fill="none" />
      </g>
    </svg>
  );
}

export default function Logo({ tamanho = 'w-9 h-9', texto = 'text-lg', subtitulo, inverso = false }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      <Simbolo className={tamanho} inverso={inverso} />
      <span className="leading-tight min-w-0">
        <span className={`block font-display font-extrabold ${texto}`}>InovaHub</span>
        {subtitulo && <span className="block text-[11px] texto-suave truncate">{subtitulo}</span>}
      </span>
    </span>
  );
}
