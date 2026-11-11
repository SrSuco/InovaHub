import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { gravar, ler } from '../services/armazenamento.js';
import { hexParaOklch } from '../utils/cores.js';

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
    let { L, C, H } = hexParaOklch(destaque);
    if (escuro) L = Math.max(L, 0.62);
    raiz.style.setProperty('--p', `${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}`);
    raiz.style.setProperty('--pc', L > 0.7 ? `18% 0.02 ${H.toFixed(0)}` : '99% 0 0');
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
