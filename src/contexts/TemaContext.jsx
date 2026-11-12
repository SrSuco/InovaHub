import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { gravar, ler } from '../services/armazenamento.js';
import { variaveisDestaque } from '../utils/cores.js';

const TemaContext = createContext(null);
const consultaEscuro = () => window.matchMedia?.('(prefers-color-scheme: dark)');

/**
 * Controla o modo (sistema, claro ou escuro) e a cor de destaque.
 * A cor de destaque substitui as variáveis --p e --pc do DaisyUI.
 */
export function TemaProvider({ children }) {
  const [modo, setModo] = useState(() => ler('modo', 'sistema'));
  const [destaque, setDestaque] = useState(() => ler('destaque', '#AB218E'));
  const [sistemaEscuro, setSistemaEscuro] = useState(() => Boolean(consultaEscuro()?.matches));

  useEffect(() => {
    const consulta = consultaEscuro();
    if (!consulta) return undefined;
    const aoMudar = (e) => setSistemaEscuro(e.matches);
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, []);

  const escuro = modo === 'escuro' || (modo === 'sistema' && sistemaEscuro);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.setAttribute('data-theme', escuro ? 'inovahub-escuro' : 'inovahub');
    const { p, pc } = variaveisDestaque(destaque, escuro);
    raiz.style.setProperty('--p', p);
    raiz.style.setProperty('--pc', pc);
  }, [escuro, destaque]);

  const valor = useMemo(
    () => ({
      modo,
      escuro,
      destaque,
      definirModo: (m) => {
        setModo(m);
        gravar('modo', m);
      },
      definirDestaque: (hex) => {
        setDestaque(hex);
        gravar('destaque', hex);
      },
    }),
    [modo, escuro, destaque],
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return contexto;
}
