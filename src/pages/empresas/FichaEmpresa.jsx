import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { INTERACOES_EXEMPLO } from '../../data/interacoes.js';
import { BADGE_CATEGORIA } from '../../data/opcoesEmpresa.js';
import { ACOES, badgeDoPerfil } from '../../data/permissoes.js';
import { obterEmpresa, reativarEmpresa } from '../../services/empresasService.js';
import { useResponsaveis } from '../../hooks/useResponsaveis.js';
import { formatarData } from '../../utils/formatacao.js';
import { nomeExibido } from './consultaEmpresas.js';
import ModalDesativarEmpresa from './ModalDesativarEmpresa.jsx';

function Dado({ rotulo, valor }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs opacity-60">{rotulo}</dt>
      <dd className="text-sm font-medium break-words">{valor || '—'}</dd>
    </div>
  );
}

export default function FichaEmpresa() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { pode, perfil } = useSessao();
  const { avisar } = useAvisos();
  const [empresa, setEmpresa] = useState(null);
  const [aba, setAba] = useState('geral');
  const [desativando, setDesativando] = useState(null);
  const responsaveis = useResponsaveis();

  const carregar = useCallback(
    () =>
      obterEmpresa(id)
        .then(setEmpresa)
        .catch(() => navegar('/pagina-nao-encontrada', { replace: true })),
    [id, navegar],
  );
  useEffect(() => {
    carregar();
  }, [carregar]);

  useMigalhas([
    { rotulo: 'Cadastros' },
    { rotulo: 'Empresas', rota: '/empresas' },
    { rotulo: empresa ? nomeExibido(empresa) : 'Ficha' },
  ]);

  if (!empresa) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Carregando empresa">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const ativa = empresa.situacao === 'Ativa';
  const responsavel = responsaveis.find((r) => r.id === empresa.responsavelId)?.nome;
  const endereco = [
    [empresa.logradouro, empresa.numero].filter(Boolean).join(', '),
    empresa.complemento,
    empresa.bairro,
    [empresa.cidade, empresa.uf].filter(Boolean).join(' / '),
    empresa.cep,
  ]
    .filter(Boolean)
    .join(' · ');

  const abas = [
    { id: 'geral', nome: 'Visão geral', liberada: true },
    { id: 'interacoes', nome: 'Interações', liberada: pode('interacoes') },
    { id: 'contatos', nome: 'Contatos', liberada: true },
  ];
  const interacoes = INTERACOES_EXEMPLO.filter((i) => !i.privada || pode('privadas'));
  const privadasOcultas = INTERACOES_EXEMPLO.length - interacoes.length;

  async function reativar() {
    try {
      await reativarEmpresa(empresa.id);
      avisar(`${nomeExibido(empresa)} foi reativada.`);
      carregar();
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  }

  const acoes = [
    ativa && pode('empresas', 'E') && (
      <Link key="editar" to={`/empresas/${empresa.id}/editar`} className="btn btn-outline btn-sm">
        <Icone nome="edit" className="w-4 h-4" />
        Editar
      </Link>
    ),
    pode('empresas', 'P') && (
      <button key="exportar" type="button" className="btn btn-ghost btn-sm" onClick={() => avisar(`Ficha de ${nomeExibido(empresa)} exportada em PDF.`, 'info')}>
        <Icone nome="download" className="w-4 h-4" />
        Exportar
      </button>
    ),
    ativa && pode('empresas', 'D') && (
      <button key="desativar" type="button" className="btn btn-ghost btn-sm text-error" onClick={() => setDesativando(empresa)}>
        <Icone nome="ban" className="w-4 h-4" />
        Desativar
      </button>
    ),
    !ativa && pode('empresas', 'D') && (
      <button key="reativar" type="button" className="btn btn-primary btn-sm" onClick={reativar}>
        <Icone nome="refresh" className="w-4 h-4" />
        Reativar
      </button>
    ),
  ].filter(Boolean);

  return (
    <>
      <Link to="/empresas" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <Icone nome="arrowL" className="w-4 h-4" />
        Empresas
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="avatar placeholder">
            <div className="bg-base-300 w-14 rounded-xl">
              <span className="font-bold">{nomeExibido(empresa).slice(0, 2).toUpperCase()}</span>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{nomeExibido(empresa)}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`badge badge-sm ${BADGE_CATEGORIA[empresa.categoria]}`}>{empresa.categoria}</span>
              <span className={`badge badge-sm ${ativa ? 'badge-success badge-outline' : 'badge-ghost'}`}>{ativa ? 'Ativa' : 'Desativada'}</span>
              <span className="text-sm opacity-70">
                {empresa.setor} · {empresa.cnpj}
              </span>
            </div>
          </div>
        </div>
        {acoes.length > 0 ? (
          <div className="flex flex-wrap gap-2">{acoes}</div>
        ) : (
          <span className="badge badge-outline gap-1 py-3">
            <Icone nome="lock" className="w-3.5 h-3.5" />
            Somente leitura
          </span>
        )}
      </div>

      {!ativa && empresa.desativacao && (
        <div role="status" className="alert mb-4 flex items-start text-left text-sm">
          <Icone nome="ban" />
          <div>
            <b>Empresa desativada em {formatarData(empresa.desativacao.dataSaida)}.</b> Motivo: {empresa.desativacao.motivo}.
            {empresa.desativacao.observacao && <div className="opacity-80">{empresa.desativacao.observacao}</div>}
            <div className="opacity-80">Os dados e o histórico continuam guardados. Para editar, reative o cadastro.</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="cartao xl:col-span-2 min-w-0">
          <div className="card-body p-5 gap-4">
            <div className="overflow-x-auto -mx-1 px-1">
              <div role="tablist" className="tabs tabs-bordered w-max">
                {abas.map((a) =>
                  a.liberada ? (
                    <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={`tab ${aba === a.id ? 'tab-active' : ''}`} onClick={() => setAba(a.id)}>
                      {a.nome}
                    </button>
                  ) : (
                    <span key={a.id} role="tab" aria-disabled="true" className="tab tab-disabled gap-1" title={`Seu perfil não tem acesso a ${a.nome.toLowerCase()}`}>
                      <Icone nome="lock" className="w-3 h-3" />
                      {a.nome}
                    </span>
                  ),
                )}
              </div>
            </div>

            {aba === 'geral' && (
              <>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Dado rotulo="Razão social" valor={empresa.razaoSocial} />
                  <Dado rotulo="Nome fantasia" valor={empresa.nomeFantasia} />
                  <Dado rotulo="CNPJ" valor={empresa.cnpj} />
                  <Dado rotulo="Inscrição estadual" valor={empresa.inscricaoEstadual} />
                  <Dado rotulo="Porte" valor={empresa.porte} />
                  <Dado rotulo="Data de fundação" valor={formatarData(empresa.dataFundacao)} />
                  <Dado rotulo="Responsável no parque" valor={responsavel} />
                  <Dado rotulo="Entrada no parque" valor={formatarData(empresa.dataEntrada)} />
                  <Dado
                    rotulo="Site"
                    valor={empresa.site && <a className="link link-primary" href={empresa.site} target="_blank" rel="noreferrer">{empresa.site}</a>}
                  />
                  <Dado rotulo="Cadastrada em" valor={formatarData(empresa.criadoEm)} />
                  <div className="sm:col-span-2">
                    <Dado rotulo="Endereço" valor={endereco} />
                  </div>
                  {empresa.observacoes && (
                    <div className="sm:col-span-2">
                      <Dado rotulo="Observações" valor={empresa.observacoes} />
                    </div>
                  )}
                </dl>
              </>
            )}

            {aba === 'interacoes' && (
              <>
                <ul className="flex flex-col gap-4">
                  {interacoes.map((i) => (
                    <li key={i.tipo} className="flex gap-3">
                      <span className="mt-1 text-primary">
                        <Icone nome="chat" className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{i.tipo}</span>
                          {i.privada && (
                            <span className="badge badge-warning badge-outline badge-sm gap-1">
                              <Icone nome="lock" className="w-3 h-3" />
                              privada
                            </span>
                          )}
                        </div>
                        <div className="text-xs texto-suave">
                          {i.quando} · {i.autor}
                        </div>
                        <p className="text-sm mt-1 opacity-90">{i.texto}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {privadasOcultas > 0 && (
                  <div className="alert text-xs py-2">
                    <Icone nome="eyeoff" className="w-4 h-4" />
                    <span>{privadasOcultas} interação privada não aparece para o seu perfil.</span>
                  </div>
                )}
              </>
            )}

            {aba === 'contatos' && (
              <ul className="divide-y divide-base-300">
                <li className="py-3 flex flex-wrap items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-base-300 w-10 rounded-full">
                      <span className="text-xs font-semibold">{empresa.contatoNome.slice(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {empresa.contatoNome} <span className="badge badge-ghost badge-sm ml-1">principal</span>
                    </div>
                    <div className="text-xs texto-suave">{empresa.contatoCargo || 'Cargo não informado'}</div>
                  </div>
                  <div className="flex flex-col text-sm gap-1">
                    <a href={`mailto:${empresa.email}`} className="link link-hover flex items-center gap-2">
                      <Icone nome="mail" className="w-4 h-4" />
                      {empresa.email}
                    </a>
                    <a href={`tel:${empresa.telefone}`} className="link link-hover flex items-center gap-2">
                      <Icone nome="phone" className="w-4 h-4" />
                      {empresa.telefone}
                    </a>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>

        <aside className="cartao h-max min-w-0">
          <div className="card-body p-5 gap-3">
            <h2 className="card-title text-base">
              <Icone nome="shieldok" className="w-5 h-5 text-primary" />
              Seu acesso a esta empresa
            </h2>
            <div className="text-sm">
              <span className="texto-suave">Perfil</span> <span className={`badge badge-sm ${badgeDoPerfil(perfil)}`}>{perfil}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {ACOES.map((a) => (
                <li key={a.id} className={`flex items-center gap-2 text-sm ${pode('empresas', a.id) ? '' : 'texto-suave'}`}>
                  <Icone nome={pode('empresas', a.id) ? 'check' : 'x'} className={`w-4 h-4 ${pode('empresas', a.id) ? 'text-success' : ''}`} />
                  {a.nome}
                </li>
              ))}
            </ul>
            <p className="text-xs texto-suave">As ações disponíveis seguem a matriz de permissões do seu perfil.</p>
          </div>
        </aside>
      </div>

      <ModalDesativarEmpresa
        empresa={desativando}
        aoFechar={() => setDesativando(null)}
        aoConcluir={() => {
          setDesativando(null);
          avisar(`${nomeExibido(empresa)} foi desativada.`);
          carregar();
        }}
      />
    </>
  );
}
