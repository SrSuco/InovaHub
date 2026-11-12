import Icone from '../Icone.jsx';

/**
 * Campo de formulário com rótulo acima, marcação de obrigatório,
 * mensagem de erro abaixo e atributos de acessibilidade.
 * `children` recebe as props de acessibilidade e deve repassá-las ao input.
 */
export default function Campo({ id, rotulo, obrigatorio, erro, ajuda, className = '', children }) {
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const descritoPor = [erro && idErro, ajuda && idAjuda].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-control w-full min-w-0 ${className}`}>
      <label htmlFor={id} className="label pb-1">
        <span className="label-text">
          {rotulo}
          {obrigatorio && <span aria-hidden="true"> *</span>}
        </span>
      </label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descritoPor, 'aria-required': obrigatorio || undefined })}
      {ajuda && !erro && (
        <span id={idAjuda} className="text-xs texto-suave mt-1">
          {ajuda}
        </span>
      )}
      {erro && (
        <span id={idErro} className="text-xs text-error mt-1 flex items-start gap-1">
          <Icone nome="alert" className="w-3.5 h-3.5 mt-px" />
          {erro}
        </span>
      )}
    </div>
  );
}

/** Classes do input conforme o estado de erro. */
export const classeInput = (erro, base = 'input input-bordered w-full') => `${base} ${erro ? 'input-error' : ''}`;
export const classeSelect = (erro) => `select select-bordered w-full ${erro ? 'select-error' : ''}`;
export const classeTextarea = (erro) => `textarea textarea-bordered w-full ${erro ? 'textarea-error' : ''}`;
