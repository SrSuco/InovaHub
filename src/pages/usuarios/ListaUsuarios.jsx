import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoVazio from '../../components/EstadoVazio.jsx';
import Icone from '../../components/Icone.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import Modal from '../../components/Modal.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { PERFIS, badgeDoPerfil } from '../../data/permissoes.js';
import { iniciais } from '../../data/usuarios.js';
import { alterarSituacaoUsuario, listarUsuarios } from '../../services/usuariosService.js';
import { normalizar } from '../empresas/consultaEmpresas.js';

const SITUACOES = ['Ativo', 'Convite pendente', 'Desativado'];
const badgeSituacao = (s) => (s === 'Ativo' ? 'badge-success badge-outline' : s === 'Convite pendente' ? 'badge-warning badge-outline' : 'badge-ghost');

function Avatar({ nome, tamanho = 'w-9' }) {
  return (
    <div className="avatar placeholder">
      <div className={`bg-base-300 text-base-content ${tamanho} rounded-full`}>
        <span className="text-xs font-semibold">{iniciais(nome)}</span>
      </div>
    </div>
  );
}

export default function ListaUsuarios() {
  useMigalhas([{ rotulo: 'Administração' }, { rotulo: 'Usuários' }]);
  const { usuario: logado, pode } = useSessao();
  const { avisar } = useAvisos();
  const [usuarios, setUsuarios] = useState(null);
  const [busca, setBusca] = useState('');
  const [perfil, setPerfil] = useState('');
  const [situacao, setSituacao] = useState('');
  const [desativando, setDesativando] = useState(null);

  const carregar = useCallback(() => listarUsuarios().then(setUsuarios), []);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(
    () =>
      (usuarios ?? []).filter(
        (u) =>
          (!busca || [u.nome, u.email].some((v) => normalizar(v).includes(normalizar(busca)))) &&
          (!perfil || u.perfil === perfil) &&
          (!situacao || u.situacao === situacao),
      ),
    [usuarios, busca, perfil, situacao],
  );

  if (!usuarios) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Carregando usuários">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const conta = (s) => usuarios.filter((u) => u.situacao === s).length;

  async function mudarSituacao(u, nova, mensagem) {
    await alterarSituacaoUsuario(u.id, nova);
    avisar(mensagem);
    carregar();
  }

  function acoes(u) {
    const ehVoce = u.id === logado.id;
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Ações para ${u.nome}`}>
          <Icone nome="dots" className="w-4 h-4" />
        </div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-20 w-56 p-2 shadow-lg border border-base-300">
          {pode('usuarios', 'E') && (
            <li>
              <Link to={`/usuarios/${u.id}/editar`}>
                <Icone nome="edit" className="w-4 h-4" />
                Editar
              </Link>
            </li>
          )}
          <li>
            {u.situacao === 'Convite pendente' ? (
              <button type="button" onClick={() => avisar(`Convite reenviado para ${u.email}.`, 'info')}>
                <Icone nome="mail" className="w-4 h-4" />
                Reenviar convite
              </button>
            ) : (
              <button type="button" onClick={() => avisar(`Link de redefinição de senha enviado para ${u.email}.`, 'info')}>
                <Icone nome="key" className="w-4 h-4" />
                Redefinir senha
              </button>
            )}
          </li>
          {pode('usuarios', 'D') && !ehVoce && (
            <li>
              {u.situacao === 'Desativado' ? (
                <button type="button" onClick={() => mudarSituacao(u, 'Ativo', `Acesso de ${u.nome} reativado.`)}>
                  <Icone nome="check" className="w-4 h-4" />
                  Reativar acesso
                </button>
              ) : (
                <button type="button" className="text-error" onClick={() => setDesativando(u)}>
                  <Icone nome="ban" className="w-4 h-4" />
                  Desativar acesso
                </button>
              )}
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <>
      <CabecalhoPagina titulo="Usuários" subtitulo="Quem da equipe acessa o InovaHub, com qual perfil e em que situação.">
        {pode('permissoes') && (
          <Link to="/permissoes" className="btn btn-outline btn-sm">
            <Icone nome="shieldok" className="w-4 h-4" />
            Permissões
          </Link>
        )}
        {pode('usuarios', 'C') && (
          <Link to="/usuarios/novo" className="btn btn-primary btn-sm">
            <Icone nome="userplus" className="w-4 h-4" />
            Novo usuário
          </Link>
        )}
      </CabecalhoPagina>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ['Ativos', conta('Ativo'), 'text-success'],
          ['Convites pendentes', conta('Convite pendente'), 'text-warning'],
          ['Desativados', conta('Desativado'), 'opacity-60'],
          ['Perfis de acesso', PERFIS.length, 'text-primary'],
        ].map(([rotulo, valor, tom]) => (
          <div key={rotulo} className="cartao">
            <div className="card-body p-4 gap-0">
              <span className="text-xs opacity-70">{rotulo}</span>
              <span className={`text-2xl font-bold font-display tabnum ${tom}`}>{valor}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cartao">
        <div className="card-body p-4 gap-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <label className="input input-bordered input-sm flex items-center gap-2">
              <Icone nome="search" className="w-4 h-4 opacity-60" />
              <input type="search" className="grow min-w-0" placeholder="Nome ou e-mail" aria-label="Buscar usuários" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
            <select className="select select-bordered select-sm" aria-label="Filtrar por perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              <option value="">Todos os perfis</option>
              {PERFIS.map((p) => (
                <option key={p.nome}>{p.nome}</option>
              ))}
            </select>
            <select className="select select-bordered select-sm" aria-label="Filtrar por situação" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
              <option value="">Todas as situações</option>
              {SITUACOES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {filtrados.length === 0 ? (
            <EstadoVazio icone="search" titulo="Nenhum usuário encontrado" texto="Nenhum usuário corresponde à busca e aos filtros escolhidos.">
              <button type="button" className="btn btn-outline" onClick={() => { setBusca(''); setPerfil(''); setSituacao(''); }}>
                Limpar filtros
              </button>
            </EstadoVazio>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Perfil</th>
                      <th>Situação</th>
                      <th className="hidden xl:table-cell">Vínculo</th>
                      <th>Último acesso</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((u) => (
                      <tr key={u.id} className={`hover ${u.situacao === 'Desativado' ? 'opacity-60' : ''}`}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar nome={u.nome} />
                            <div className="min-w-0">
                              <div className="font-semibold">{u.nome}</div>
                              <div className="text-xs opacity-60 truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-sm ${badgeDoPerfil(u.perfil)}`}>{u.perfil}</span></td>
                        <td><span className={`badge badge-sm ${badgeSituacao(u.situacao)}`}>{u.situacao}</span></td>
                        <td className="hidden xl:table-cell">{u.vinculo}</td>
                        <td className="whitespace-nowrap">{u.ultimoAcesso}</td>
                        <td className="text-right">{acoes(u)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="md:hidden divide-y divide-base-300">
                {filtrados.map((u) => (
                  <li key={u.id} className={`py-3 flex items-start gap-3 ${u.situacao === 'Desativado' ? 'opacity-60' : ''}`}>
                    <Avatar nome={u.nome} tamanho="w-10" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{u.nome}</div>
                      <div className="text-xs opacity-60 truncate">{u.email}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`badge badge-sm ${badgeDoPerfil(u.perfil)}`}>{u.perfil}</span>
                        <span className={`badge badge-sm ${badgeSituacao(u.situacao)}`}>{u.situacao}</span>
                      </div>
                      <div className="text-xs opacity-60 mt-1">Último acesso: {u.ultimoAcesso}</div>
                    </div>
                    {acoes(u)}
                  </li>
                ))}
              </ul>
              <div className="text-sm opacity-70">
                Mostrando {filtrados.length} de {usuarios.length} usuários
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        aberto={Boolean(desativando)}
        aoFechar={() => setDesativando(null)}
        titulo={`Desativar acesso de ${desativando?.nome ?? ''}?`}
        acoes={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDesativando(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={() => {
                const u = desativando;
                setDesativando(null);
                mudarSituacao(u, 'Desativado', `Acesso de ${u.nome} desativado.`);
              }}
            >
              Desativar acesso
            </button>
          </>
        }
      >
        <p className="text-sm opacity-80 mt-2">
          A pessoa sai do sistema na hora e não consegue mais entrar. O histórico de interações dela continua guardado, e você pode reativar o acesso depois.
        </p>
      </Modal>
    </>
  );
}
