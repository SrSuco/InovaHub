import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icone from '../components/Icone.jsx';

const AvisosContext = createContext(null);
const TEMPO_VISIVEL = 4000;

const estilos = {
  sucesso: { classe: 'alert-success', icone: 'check' },
  erro: { classe: 'alert-error', icone: 'alert' },
  info: { classe: 'alert-info', icone: 'info' },
};

/** Avisos rápidos (toasts) que somem sozinhos depois de 4 segundos. */
export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const fechar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);

  const avisar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = `${Date.now()}-${Math.random()}`;
      setAvisos((lista) => [...lista, { id, mensagem, tipo }]);
      setTimeout(() => fechar(id), TEMPO_VISIVEL);
    },
    [fechar],
  );

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="toast toast-end toast-bottom z-50" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} role="status" className={`alert ${estilos[a.tipo].classe} shadow-lg text-sm max-w-sm`}>
            <Icone nome={estilos[a.tipo].icone} />
            <span>{a.mensagem}</span>
            <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => fechar(a.id)} aria-label="Fechar aviso">
              <Icone nome="x" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export function useAvisos() {
  const contexto = useContext(AvisosContext);
  if (!contexto) throw new Error('useAvisos deve ser usado dentro de AvisosProvider');
  return contexto;
}
