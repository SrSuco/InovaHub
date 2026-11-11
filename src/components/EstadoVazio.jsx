import Icone from './Icone.jsx';

/** Padrão EmptyView: ícone, título, explicação e ações. */
export default function EstadoVazio({ icone = 'inbox', titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary grid place-items-center mb-4">
        <Icone nome={icone} className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="text-sm opacity-70 mt-2 max-w-md">{texto}</p>
      {children && <div className="flex flex-wrap justify-center gap-2 mt-6">{children}</div>}
    </div>
  );
}
