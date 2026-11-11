import { useState } from 'react';
import Icone from '../../components/Icone.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { ACOES, ADMINISTRADOR, MATRIZ_PADRAO, MODULOS, PERFIS } from '../../data/permissoes.js';
import { alternarAcao } from './matriz.js';

export default function Permissoes() {
  useMigalhas([{ rotulo: 'Administração' }, { rotulo: 'Permissões' }]);
  const { matriz, salvarMatriz, pode } = useSessao();
  const { avisar } = useAvisos();
  const [rascunho, setRascunho] = useState(matriz);
  const [perfil, setPerfil] = useState('Gerência');
  const alterado = JSON.stringify(rascunho) !== JSON.stringify(matriz);
  const bloqueado = perfil === ADMINISTRADOR || !pode('permissoes', 'E');

  return (
    <>
      <CabecalhoPagina titulo="Permissões" subtitulo="O que cada perfil pode ver e fazer em cada módulo do InovaHub.">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRascunho(MATRIZ_PADRAO)} disabled={!pode('permissoes', 'E')}>
          <Icone nome="refresh" className="w-4 h-4" />
          Restaurar padrão
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!alterado}
          onClick={async () => {
            try {
              setRascunho(await salvarMatriz(rascunho));
              avisar('Permissões salvas. Valem no próximo acesso de cada pessoa.');
            } catch (erro) {
              avisar(erro.message, 'erro');
            }
          }}
        >
          <Icone nome="save" className="w-4 h-4" />
          Salvar
        </button>
      </CabecalhoPagina>

      {alterado && (
        <div role="status" className="alert alert-warning mb-4 text-sm flex text-left">
          <Icone nome="alert" />
          <span>Há alterações não salvas na matriz de permissões.</span>
        </div>
      )}

      <div className="cartao">
        <div className="card-body p-4 gap-4">
          <div className="overflow-x-auto max-w-full">
            <div role="tablist" aria-label="Perfil" className="tabs tabs-boxed w-max">
              {PERFIS.map((p) => (
                <button key={p.nome} type="button" role="tab" aria-selected={perfil === p.nome} className={`tab ${perfil === p.nome ? 'tab-active' : ''}`} onClick={() => setPerfil(p.nome)}>
                  {p.nome}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm opacity-70">{PERFIS.find((p) => p.nome === perfil).descricao}</p>
          {perfil === ADMINISTRADOR && (
            <div className="alert text-sm flex text-left">
              <Icone nome="lock" />
              <span>O Administrador sempre tem acesso total, para que ninguém perca o controle do sistema.</span>
            </div>
          )}

          <div className="hidden md:block overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  {ACOES.map((a) => (
                    <th key={a.id} className="text-center">
                      {a.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULOS.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.nome}</td>
                    {ACOES.map((a) => (
                      <td key={a.id} className="text-center">
                        {m.acoes.includes(a.id) ? (
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            aria-label={`${perfil}: ${a.nome} em ${m.nome}`}
                            checked={perfil === ADMINISTRADOR || (rascunho[perfil]?.[m.id] ?? '').includes(a.id)}
                            disabled={bloqueado}
                            onChange={() => setRascunho((r) => alternarAcao(r, perfil, m.id, a.id))}
                          />
                        ) : (
                          <span className="opacity-30" aria-hidden="true">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden flex flex-col gap-3">
            {MODULOS.map((m) => (
              <li key={m.id} className="rounded-box border border-base-300 p-3">
                <div className="font-medium text-sm mb-2">{m.nome}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {ACOES.filter((a) => m.acoes.includes(a.id)).map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={perfil === ADMINISTRADOR || (rascunho[perfil]?.[m.id] ?? '').includes(a.id)}
                        disabled={bloqueado}
                        onChange={() => setRascunho((r) => alternarAcao(r, perfil, m.id, a.id))}
                      />
                      {a.nome}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
