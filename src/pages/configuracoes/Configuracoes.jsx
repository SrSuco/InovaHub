import { useState } from 'react';
import Icone from '../../components/Icone.jsx';
import Campo, { classeInput } from '../../components/formulario/Campo.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { useTema } from '../../contexts/TemaContext.jsx';
import { gravar, ler } from '../../services/armazenamento.js';
import { CORES_DESTAQUE } from '../../utils/cores.js';
import { emailValido } from '../../utils/validacao.js';

const PARQUE_PADRAO = { nome: 'InovaParq · Parque de Inovação da UNIVILLE', email: 'inovaparq@univille.br', diasSemAcompanhamento: 30 };

export default function Configuracoes() {
  useMigalhas([{ rotulo: 'Parque' }, { rotulo: 'Configurações' }]);
  const { pode } = useSessao();
  const { avisar } = useAvisos();
  const { modo, definirModo, destaque, definirDestaque } = useTema();
  const [parque, setParque] = useState(() => ler('parque', PARQUE_PADRAO));
  const [erros, setErros] = useState({});
  const podeEditar = pode('configuracoes', 'E');

  function salvar(e) {
    e.preventDefault();
    const encontrados = {};
    if (parque.nome.trim().length < 3) encontrados.nome = 'Informe o nome do parque.';
    if (!emailValido(parque.email)) encontrados.email = 'Informe um e-mail válido.';
    const dias = Number(parque.diasSemAcompanhamento);
    if (!Number.isInteger(dias) || dias < 7 || dias > 180) encontrados.dias = 'Use um número entre 7 e 180.';
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    gravar('parque', parque);
    avisar('Configurações do parque salvas.');
  }

  return (
    <>
      <CabecalhoPagina titulo="Configurações" subtitulo="Dados do parque e aparência do sistema." />
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <form className="cartao" onSubmit={salvar} noValidate>
          <div className="card-body p-5 gap-1">
            <h2 className="card-title text-base">Dados do parque</h2>
            <Campo id="cfg-nome" rotulo="Nome exibido" obrigatorio erro={erros.nome}>
              {(a11y) => <input {...a11y} className={classeInput(erros.nome)} value={parque.nome} disabled={!podeEditar} onChange={(e) => setParque({ ...parque, nome: e.target.value })} />}
            </Campo>
            <Campo id="cfg-email" rotulo="E-mail para avisos" obrigatorio erro={erros.email}>
              {(a11y) => <input {...a11y} type="email" className={classeInput(erros.email)} value={parque.email} disabled={!podeEditar} onChange={(e) => setParque({ ...parque, email: e.target.value })} />}
            </Campo>
            <Campo id="cfg-dias" rotulo="Dias sem interação para alertar" erro={erros.dias} ajuda="Empresas sem interação há mais dias que isso aparecem em Sem acompanhamento.">
              {(a11y) => (
                <input {...a11y} type="number" min="7" max="180" className={classeInput(erros.dias)} value={parque.diasSemAcompanhamento} disabled={!podeEditar} onChange={(e) => setParque({ ...parque, diasSemAcompanhamento: e.target.value })} />
              )}
            </Campo>
            {podeEditar && (
              <div className="flex justify-end mt-3">
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar
                </button>
              </div>
            )}
          </div>
        </form>

        <section className="cartao">
          <div className="card-body p-5 gap-4">
            <h2 className="card-title text-base">Aparência</h2>
            <p className="text-xs opacity-70 -mt-2">Preferências deste navegador. Não afetam os outros usuários.</p>
            <fieldset>
              <legend className="text-sm font-medium mb-2">Modo</legend>
              <div className="join">
                {[
                  ['sistema', 'Automático', 'compass'],
                  ['claro', 'Claro', 'sun'],
                  ['escuro', 'Escuro', 'moon'],
                ].map(([valor, rotulo, icone]) => (
                  <button key={valor} type="button" className={`join-item btn btn-sm ${modo === valor ? 'btn-active btn-primary' : ''}`} aria-pressed={modo === valor} onClick={() => definirModo(valor)}>
                    <Icone nome={icone} className="w-4 h-4" />
                    {rotulo}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium mb-2">Cor de destaque</legend>
              <div className="flex flex-wrap items-center gap-3">
                {CORES_DESTAQUE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className={`w-9 h-9 rounded-full border-2 border-base-100 ${destaque.toLowerCase() === c.hex.toLowerCase() ? 'ring-2 ring-base-content' : 'ring-1 ring-base-300'}`}
                    style={{ background: c.hex }}
                    title={c.nome}
                    aria-label={`Cor de destaque ${c.nome}`}
                    aria-pressed={destaque.toLowerCase() === c.hex.toLowerCase()}
                    onClick={() => definirDestaque(c.hex)}
                  />
                ))}
                <label className="flex items-center gap-2 text-sm">
                  <input type="color" className="w-9 h-9 rounded cursor-pointer bg-transparent" value={destaque} onChange={(e) => definirDestaque(e.target.value)} aria-label="Escolher outra cor de destaque" />
                  Outra cor
                </label>
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs opacity-60">Prévia:</span>
              <button type="button" className="btn btn-primary btn-sm">Botão principal</button>
              <span className="badge badge-primary">Incubada</span>
              <a href="#previa" className="link link-primary text-sm" onClick={(e) => e.preventDefault()}>Link</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
