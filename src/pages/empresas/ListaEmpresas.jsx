import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import EstadoVazio from '../../components/EstadoVazio.jsx';
import Icone from '../../components/Icone.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { BADGE_CATEGORIA, CATEGORIAS, SETORES } from '../../data/opcoesEmpresa.js';
import { listarEmpresas, reativarEmpresa } from '../../services/empresasService.js';
import { useResponsaveis } from '../../hooks/useResponsaveis.js';
import {
  ABAS_SITUACAO,
  FILTROS_PADRAO,
  ORDENACOES,
  consultarEmpresas,
  contarPorSituacao,
  nomeExibido,
  temFiltroAtivo,
} from './consultaEmpresas.js';
import ModalDesativarEmpresa from './ModalDesativarEmpresa.jsx';

const sigla = (empresa) =>
  nomeExibido(empresa)
    .replace(/[^A-Za-zÀ-ú ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Lê os filtros da URL, para que o link possa ser compartilhado e o "voltar" funcione. */
function useFiltrosNaUrl() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(
    () => Object.fromEntries(Object.entries(FILTROS_PADRAO).map(([chave, padrao]) => [chave, params.get(chave) ?? padrao])),
    [params],
  );
  const alterar = useCallback(
    (mudancas) => {
      const novos = { ...filtros, pagina: 1, ...mudancas };
      const limpos = Object.entries(novos).filter(([chave, valor]) => String(valor) !== String(FILTROS_PADRAO[chave]));
      setParams(Object.fromEntries(limpos), { replace: true });
    },
    [filtros, setParams],
  );
  return [filtros, alterar];
}

function CabecalhoOrdenavel({ id, rotulo, filtros, alterar, className = '' }) {
  const ativo = filtros.ordem === id;
  const proximaDirecao = ativo && filtros.dir === 'asc' ? 'desc' : 'asc';
  return (
    <th className={className} aria-sort={ativo ? (filtros.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${ativo ? 'text-primary' : ''}`}
        onClick={() => alterar({ ordem: id, dir: proximaDirecao })}
      >
        {rotulo}
        <Icone nome={ativo ? (filtros.dir === 'asc' ? 'up' : 'down') : 'sort'} className="w-3.5 h-3.5" />
      </button>
    </th>
  );
}

export default function ListaEmpresas() {
  useMigalhas([{ rotulo: 'Cadastros' }, { rotulo: 'Empresas' }]);
  const { pode } = useSessao();
  const { avisar } = useAvisos();
  const navegar = useNavigate();
  const [filtros, alterar] = useFiltrosNaUrl();
  const [empresas, setEmpresas] = useState(null);
  const [desativando, setDesativando] = useState(null);
  const responsaveis = useResponsaveis();
  const nomeResponsavel = (id) => responsaveis.find((r) => r.id === id)?.nome ?? '—';

  const carregar = useCallback(
    () => listarEmpresas().then(setEmpresas).catch((erro) => avisar(erro.message, 'erro')),
    [avisar],
  );
  useEffect(() => {
    carregar();
  }, [carregar]);

  if (!empresas) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Carregando empresas">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const resultado = consultarEmpresas(empresas, filtros);
  const contagem = contarPorSituacao(empresas);
  const podeCriar = pode('empresas', 'C');
  const podeEditar = pode('empresas', 'E');
  const podeDesativar = pode('empresas', 'D');

  async function reativar(empresa) {
    try {
      await reativarEmpresa(empresa.id);
      avisar(`${nomeExibido(empresa)} foi reativada.`);
      carregar();
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  }

  function acoes(empresa) {
    const ativa = empresa.situacao === 'Ativa';
    return (
      <div className="flex justify-end gap-1">
        <Link to={`/empresas/${empresa.id}`} className="btn btn-ghost btn-sm btn-square" title="Ver ficha" aria-label={`Ver ficha de ${nomeExibido(empresa)}`}>
          <Icone nome="eye" className="w-4 h-4" />
        </Link>
        {podeEditar && ativa && (
          <Link to={`/empresas/${empresa.id}/editar`} className="btn btn-ghost btn-sm btn-square" title="Editar" aria-label={`Editar ${nomeExibido(empresa)}`}>
            <Icone nome="edit" className="w-4 h-4" />
          </Link>
        )}
        {podeDesativar && ativa && (
          <button type="button" className="btn btn-ghost btn-sm btn-square text-error" title="Desativar" aria-label={`Desativar ${nomeExibido(empresa)}`} onClick={() => setDesativando(empresa)}>
            <Icone nome="ban" className="w-4 h-4" />
          </button>
        )}
        {podeDesativar && !ativa && (
          <button type="button" className="btn btn-ghost btn-sm btn-square text-success" title="Reativar" aria-label={`Reativar ${nomeExibido(empresa)}`} onClick={() => reativar(empresa)}>
            <Icone nome="refresh" className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  const badgeSituacao = (e) =>
    e.situacao === 'Desativada' && <span className="badge badge-ghost badge-sm">Desativada</span>;

  const baseVazia = empresas.length === 0;
  const filtroAtivo = temFiltroAtivo(filtros);

  let conteudo;
  if (baseVazia) {
    conteudo = (
      <EstadoVazio
        icone="building"
        titulo="Nenhuma empresa cadastrada ainda"
        texto="Cadastre as incubadas, residentes, parceiras e prospects do parque para acompanhar contatos, interações e indicadores em um só lugar."
      >
        {podeCriar ? (
          <>
            <Link to="/empresas/nova" className="btn btn-primary">
              <Icone nome="plus" className="w-4 h-4" />
              Cadastrar primeira empresa
            </Link>
            <button type="button" className="btn btn-outline" onClick={() => avisar('A importação de planilhas chega em uma próxima versão.', 'info')}>
              <Icone nome="file" className="w-4 h-4" />
              Importar planilha
            </button>
          </>
        ) : (
          <p className="text-sm opacity-70">Peça a um analista do parque para cadastrar as empresas.</p>
        )}
      </EstadoVazio>
    );
  } else if (resultado.total === 0) {
    conteudo = (
      <EstadoVazio
        icone="search"
        titulo="Nenhuma empresa encontrada"
        texto={
          filtros.busca
            ? `Nenhuma empresa corresponde a "${filtros.busca}" com os filtros escolhidos. Confira a grafia ou busque pelo CNPJ.`
            : 'Nenhuma empresa corresponde aos filtros escolhidos.'
        }
      >
        <button type="button" className="btn btn-outline" onClick={() => alterar({ busca: '', categoria: '', setor: '', responsavel: '' })}>
          Limpar filtros
        </button>
      </EstadoVazio>
    );
  } else {
    conteudo = (
      <>
        <ul className="md:hidden divide-y divide-base-300">
          {resultado.itens.map((e) => (
            <li key={e.id} className={`py-3 flex items-start gap-3 ${e.situacao === 'Desativada' ? 'linha-desativada' : ''}`}>
              <div className="avatar placeholder">
                <div className="bg-base-300 w-10 rounded-lg">
                  <span className="text-xs font-semibold">{sigla(e)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/empresas/${e.id}`} className="font-semibold hover:underline">
                  {nomeExibido(e)}
                </Link>
                <div className="text-xs texto-suave truncate">{e.cnpj}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`badge badge-sm ${BADGE_CATEGORIA[e.categoria]}`}>{e.categoria}</span>
                  {badgeSituacao(e)}
                </div>
                <div className="text-xs opacity-70 mt-1 truncate">
                  {e.contatoNome} · {e.email}
                </div>
              </div>
              {acoes(e)}
            </li>
          ))}
        </ul>

        <div className="hidden md:block overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <CabecalhoOrdenavel id="nome" rotulo="Empresa" filtros={filtros} alterar={alterar} />
                <th className="hidden xl:table-cell">CNPJ</th>
                <CabecalhoOrdenavel id="contato" rotulo="Contato" filtros={filtros} alterar={alterar} />
                <CabecalhoOrdenavel id="email" rotulo="E-mail" filtros={filtros} alterar={alterar} className="hidden lg:table-cell" />
                <CabecalhoOrdenavel id="categoria" rotulo="Categoria" filtros={filtros} alterar={alterar} />
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resultado.itens.map((e) => (
                <tr key={e.id} className={`hover ${e.situacao === 'Desativada' ? 'linha-desativada' : ''}`}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-base-300 w-9 rounded-lg">
                          <span className="text-xs font-semibold">{sigla(e)}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Link to={`/empresas/${e.id}`} className="font-semibold hover:underline">
                          {nomeExibido(e)}
                        </Link>
                        <div className="text-xs texto-suave">{e.razaoSocial}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden xl:table-cell tabnum whitespace-nowrap">{e.cnpj}</td>
                  <td>
                    <div>{e.contatoNome}</div>
                    <div className="text-xs texto-suave whitespace-nowrap">{e.telefone}</div>
                  </td>
                  <td className="hidden lg:table-cell">{e.email}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <span className={`badge badge-sm ${BADGE_CATEGORIA[e.categoria]}`}>{e.categoria}</span>
                      {badgeSituacao(e)}
                    </div>
                  </td>
                  <td>{acoes(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="opacity-70">
            Mostrando {resultado.de}–{resultado.ate} de {resultado.total}
          </span>
          <div className="join">
            <button type="button" className="join-item btn btn-sm" disabled={resultado.pagina <= 1} onClick={() => alterar({ pagina: resultado.pagina - 1 })} aria-label="Página anterior">
              «
            </button>
            {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`join-item btn btn-sm ${n === resultado.pagina ? 'btn-active' : ''}`}
                aria-current={n === resultado.pagina ? 'page' : undefined}
                onClick={() => alterar({ pagina: n })}
              >
                {n}
              </button>
            ))}
            <button type="button" className="join-item btn btn-sm" disabled={resultado.pagina >= resultado.totalPaginas} onClick={() => alterar({ pagina: resultado.pagina + 1 })} aria-label="Próxima página">
              »
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CabecalhoPagina titulo="Empresas" subtitulo="Incubadas, residentes, parceiras, investidores e prospects em um único cadastro.">
        {pode('empresas', 'P') && !baseVazia && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => avisar(`Exportação de ${resultado.total} empresas iniciada. O arquivo chega no seu e-mail.`, 'info')}>
            <Icone nome="download" className="w-4 h-4" />
            Exportar
          </button>
        )}
        {podeCriar && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navegar('/empresas/nova')}>
            <Icone nome="plus" className="w-4 h-4" />
            Nova empresa
          </button>
        )}
      </CabecalhoPagina>

      <div className="cartao">
        <div className="card-body p-4 gap-4">
          {!baseVazia && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="overflow-x-auto max-w-full">
                  <div role="tablist" aria-label="Situação" className="tabs tabs-boxed tabs-sm w-max">
                    {ABAS_SITUACAO.map((aba) => (
                      <button
                        key={aba.id}
                        type="button"
                        role="tab"
                        aria-selected={filtros.situacao === aba.id}
                        className={`tab ${filtros.situacao === aba.id ? 'tab-active' : ''}`}
                        onClick={() => alterar({ situacao: aba.id })}
                      >
                        {aba.rotulo} <span className="ml-1 tabnum">{contagem[aba.id]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="input input-bordered input-sm flex items-center gap-2 sm:ml-auto w-full sm:w-80">
                  <Icone nome="search" className="w-4 h-4 opacity-60" />
                  <input
                    type="search"
                    className="grow min-w-0"
                    placeholder="Nome, CNPJ, contato ou e-mail"
                    aria-label="Buscar empresas"
                    value={filtros.busca}
                    onChange={(e) => alterar({ busca: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <select className="select select-bordered select-sm w-full" aria-label="Filtrar por categoria" value={filtros.categoria} onChange={(e) => alterar({ categoria: e.target.value })}>
                  <option value="">Categoria: todas</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select className="select select-bordered select-sm w-full" aria-label="Filtrar por setor" value={filtros.setor} onChange={(e) => alterar({ setor: e.target.value })}>
                  <option value="">Setor: todos</option>
                  {SETORES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select className="select select-bordered select-sm w-full" aria-label="Filtrar por responsável" value={filtros.responsavel} onChange={(e) => alterar({ responsavel: e.target.value })}>
                  <option value="">Responsável: todos</option>
                  {responsaveis.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select className="select select-bordered select-sm flex-1 min-w-0" aria-label="Ordenar por" value={filtros.ordem} onChange={(e) => alterar({ ordem: e.target.value, pagina: filtros.pagina })}>
                    {ORDENACOES.map((o) => (
                      <option key={o.id} value={o.id}>
                        Ordenar: {o.rotulo}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-sm btn-square btn-outline"
                    aria-label={filtros.dir === 'asc' ? 'Ordem crescente. Trocar para decrescente' : 'Ordem decrescente. Trocar para crescente'}
                    title={filtros.dir === 'asc' ? 'Crescente' : 'Decrescente'}
                    onClick={() => alterar({ dir: filtros.dir === 'asc' ? 'desc' : 'asc', pagina: filtros.pagina })}
                  >
                    <Icone nome={filtros.dir === 'asc' ? 'up' : 'down'} className="w-4 h-4" />
                  </button>
                </div>
                {filtroAtivo && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => alterar({ busca: '', categoria: '', setor: '', responsavel: '' })}>
                    <Icone nome="x" className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </>
          )}
          {conteudo}
        </div>
      </div>

      <ModalDesativarEmpresa
        empresa={desativando}
        aoFechar={() => setDesativando(null)}
        aoConcluir={(empresa) => {
          setDesativando(null);
          avisar(`${nomeExibido(empresa)} foi desativada. Ela continua na aba Desativadas.`);
          carregar();
        }}
      />
    </>
  );
}
