/** Título da página, subtítulo e ações (botões) à direita. */
export default function CabecalhoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        {subtitulo && <p className="text-sm opacity-70 mt-1">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
