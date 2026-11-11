import { useEffect, useRef } from 'react';

/** Modal acessível baseado no elemento <dialog> (fecha com Esc e clicando fora). */
export default function Modal({ aberto, aoFechar, titulo, children, acoes }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={aoFechar} aria-labelledby="modal-titulo">
      <div className="modal-box">
        <h3 id="modal-titulo" className="text-lg font-bold">
          {titulo}
        </h3>
        {children}
        {acoes && <div className="modal-action">{acoes}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">fechar</button>
      </form>
    </dialog>
  );
}
