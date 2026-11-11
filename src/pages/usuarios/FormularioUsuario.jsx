import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import Campo, { classeInput, classeSelect } from '../../components/formulario/Campo.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { ACOES, MODULOS, PERFIS, temPermissao } from '../../data/permissoes.js';
import { obterUsuario, salvarUsuario } from '../../services/usuariosService.js';
import { VINCULOS, validarUsuario } from './validacaoUsuario.js';

const NOVO = { nome: '', email: '', cargo: '', vinculo: 'Equipe do parque', perfil: 'Analista', primeiroAcesso: 'convite', senhaTemporaria: '' };

/** Resumo do que um perfil pode fazer, segundo a matriz atual. */
function ResumoPerfil({ perfil }) {
  const { matriz } = useSessao();
  const permitidos = MODULOS.filter((m) => temPermissao(matriz, perfil, m.id));
  const semAcesso = MODULOS.filter((m) => !temPermissao(matriz, perfil, m.id));
  return (
    <>
      <ul className="text-sm flex flex-col gap-1.5">
        {permitidos.map((m) => (
          <li key={m.id} className="flex gap-2">
            <Icone nome="check" className="w-4 h-4 text-success mt-0.5" />
            <span>
              <b>{m.nome}</b>:{' '}
              {ACOES.filter((a) => m.acoes.includes(a.id) && temPermissao(matriz, perfil, m.id, a.id))
                .map((a) => a.nome.toLowerCase())
                .join(', ')}
            </span>
          </li>
        ))}
      </ul>
      {semAcesso.length > 0 && (
        <p className="text-sm opacity-70 mt-3">
          <b>Sem acesso:</b> {semAcesso.map((m) => m.nome).join(', ')}.
        </p>
      )}
    </>
  );
}

export default function FormularioUsuario() {
  const { id } = useParams();
  const editar = Boolean(id);
  const navegar = useNavigate();
  const { avisar } = useAvisos();
  const [dados, setDados] = useState(NOVO);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(editar);
  const [salvando, setSalvando] = useState(false);

  useMigalhas([{ rotulo: 'Administração' }, { rotulo: 'Usuários', rota: '/usuarios' }, { rotulo: editar ? 'Editar usuário' : 'Novo usuário' }]);

  useEffect(() => {
    if (!editar) return;
    obterUsuario(id)
      .then((u) => {
        setDados({ ...NOVO, ...u });
        setCarregando(false);
      })
      .catch(() => navegar('/pagina-nao-encontrada', { replace: true }));
  }, [editar, id, navegar]);

  const alterar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDados((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  async function salvar(e) {
    e.preventDefault();
    const encontrados = validarUsuario(editar ? { ...dados, primeiroAcesso: 'convite' } : dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      document.getElementById(`usuario-${Object.keys(encontrados)[0]}`)?.focus();
      return;
    }
    setSalvando(true);
    try {
      const { senhaTemporaria, primeiroAcesso, ...resto } = dados;
      await salvarUsuario(resto);
      avisar(editar ? 'Alterações salvas. Valem no próximo acesso.' : `Convite enviado para ${dados.email}.`);
      navegar('/usuarios');
    } catch (erro) {
      if (erro.campos) setErros(erro.campos);
      else avisar(erro.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Carregando usuário">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <>
      <Link to="/usuarios" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <Icone nome="arrowL" className="w-4 h-4" />
        Usuários
      </Link>
      <CabecalhoPagina
        titulo={editar ? 'Editar usuário' : 'Novo usuário'}
        subtitulo={
          editar
            ? `Altere os dados e o perfil de ${dados.nome}. As mudanças valem no próximo acesso.`
            : 'A pessoa recebe um convite por e-mail e define a própria senha no primeiro acesso.'
        }
      />

      <form onSubmit={salvar} noValidate className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
          <section className="cartao">
            <div className="card-body p-5 gap-1">
              <h2 className="card-title text-base">Dados da pessoa</h2>
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 mt-2">
                <Campo id="usuario-nome" rotulo="Nome completo" obrigatorio erro={erros.nome}>
                  {(a11y) => <input {...a11y} className={classeInput(erros.nome)} value={dados.nome} onChange={alterar('nome')} />}
                </Campo>
                <Campo id="usuario-email" rotulo="E-mail institucional" obrigatorio erro={erros.email}>
                  {(a11y) => <input {...a11y} type="email" className={classeInput(erros.email)} placeholder="nome@univille.br" value={dados.email} onChange={alterar('email')} />}
                </Campo>
                <Campo id="usuario-cargo" rotulo="Cargo ou função">
                  {(a11y) => <input {...a11y} className={classeInput()} value={dados.cargo} onChange={alterar('cargo')} />}
                </Campo>
                <Campo id="usuario-vinculo" rotulo="Vínculo">
                  {(a11y) => (
                    <select {...a11y} className={classeSelect()} value={dados.vinculo} onChange={alterar('vinculo')}>
                      {VINCULOS.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  )}
                </Campo>
              </div>
            </div>
          </section>

          <fieldset className="cartao">
            <div className="card-body p-5 gap-3">
              <legend className="card-title text-base">Perfil de acesso *</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERFIS.map((p) => (
                  <label key={p.nome} className={`flex items-start gap-3 p-3 rounded-box border cursor-pointer ${dados.perfil === p.nome ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                    <input type="radio" name="perfil" value={p.nome} className="radio radio-primary radio-sm mt-0.5" checked={dados.perfil === p.nome} onChange={alterar('perfil')} />
                    <span className="min-w-0">
                      <span className="font-semibold text-sm">{p.nome}</span>
                      <span className="block text-xs opacity-70 mt-0.5">{p.descricao}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {editar ? (
            <section className="cartao">
              <div className="card-body p-5 gap-2">
                <h2 className="card-title text-base">Situação da conta</h2>
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={dados.situacao !== 'Desativado'}
                    onChange={(e) => setDados((d) => ({ ...d, situacao: e.target.checked ? 'Ativo' : 'Desativado' }))}
                  />
                  <span className="label-text">Acesso ativo</span>
                </label>
                <p className="text-xs opacity-60">Último acesso: {dados.ultimoAcesso}</p>
              </div>
            </section>
          ) : (
            <fieldset className="cartao">
              <div className="card-body p-5 gap-2">
                <legend className="card-title text-base">Primeiro acesso</legend>
                <label className="label cursor-pointer justify-start gap-3">
                  <input type="radio" name="primeiroAcesso" value="convite" className="radio radio-primary radio-sm" checked={dados.primeiroAcesso === 'convite'} onChange={alterar('primeiroAcesso')} />
                  <span className="label-text">Enviar convite por e-mail (recomendado). O link vale 72 horas.</span>
                </label>
                <label className="label cursor-pointer justify-start gap-3">
                  <input type="radio" name="primeiroAcesso" value="senha" className="radio radio-primary radio-sm" checked={dados.primeiroAcesso === 'senha'} onChange={alterar('primeiroAcesso')} />
                  <span className="label-text">Definir uma senha temporária, que a pessoa troca no primeiro acesso.</span>
                </label>
                {dados.primeiroAcesso === 'senha' && (
                  <Campo id="usuario-senhaTemporaria" rotulo="Senha temporária" obrigatorio erro={erros.senhaTemporaria} className="sm:max-w-xs">
                    {(a11y) => <input {...a11y} type="password" autoComplete="new-password" className={classeInput(erros.senhaTemporaria)} value={dados.senhaTemporaria} onChange={alterar('senhaTemporaria')} />}
                  </Campo>
                )}
              </div>
            </fieldset>
          )}
        </div>

        <aside className="flex flex-col gap-4 min-w-0">
          <div className="cartao">
            <div className="card-body p-5 gap-3">
              <h2 className="card-title text-base">
                <Icone nome="shieldok" className="w-5 h-5 text-primary" />O que o perfil {dados.perfil} pode fazer
              </h2>
              <ResumoPerfil perfil={dados.perfil} />
              <Link to="/permissoes" className="link link-primary text-xs">
                Ver todas as permissões
              </Link>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row xl:flex-col-reverse gap-2">
            <Link to="/usuarios" className="btn btn-ghost flex-1">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary flex-1" disabled={salvando}>
              {salvando && <span className="loading loading-spinner loading-sm" />}
              {editar ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}
