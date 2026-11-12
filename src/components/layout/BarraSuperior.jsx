import { Link } from 'react-router-dom';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { iniciais } from '../../data/usuarios.js';
import Icone from '../Icone.jsx';
import Logo from '../Logo.jsx';

export default function BarraSuperior({ migalhas, idGaveta }) {
  const { usuario, pode, sair } = useSessao();

  return (
    <header className="navbar bg-base-100 border-b border-base-300 gutter gap-2 min-h-16 sticky top-0 z-20">
      <label htmlFor={idGaveta} className="btn btn-ghost btn-square btn-sm lg:hidden">
        <span className="sr-only">Abrir menu</span>
        <Icone nome="menu" />
      </label>

      <nav aria-label="Você está em" className="text-sm breadcrumbs flex-1 min-w-0 hidden sm:block">
        <ul>
          <li>
            <Link to="/">Início</Link>
          </li>
          {migalhas.map((m) => (
            <li key={m.rotulo}>{m.rota ? <Link to={m.rota}>{m.rotulo}</Link> : m.rotulo}</li>
          ))}
        </ul>
      </nav>
      <Link to="/" className="flex-1 sm:hidden">
        <Logo tamanho="w-8 h-8" texto="text-base" />
      </Link>

      <label className="input input-bordered input-sm items-center gap-2 hidden md:flex w-64">
        <Icone nome="search" className="w-4 h-4 opacity-60" />
        <input type="search" className="grow" placeholder="Buscar empresa, contato…" aria-label="Busca global" />
      </label>

      <button type="button" className="btn btn-ghost btn-square btn-sm indicator" aria-label="Notificações: 3 novas">
        <Icone nome="bell" />
        <span className="badge badge-primary badge-xs indicator-item">3</span>
      </button>

      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="avatar placeholder cursor-pointer" aria-label="Menu do usuário">
          <div className="bg-primary text-primary-content w-9 rounded-full">
            <span className="text-xs font-semibold">{iniciais(usuario.nome)}</span>
          </div>
        </div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-30 w-60 p-2 shadow-lg border border-base-300 mt-2">
          <li className="menu-title">
            <span>
              {usuario.nome}
              <br />
              <span className="font-normal break-all">{usuario.email}</span>
            </span>
          </li>
          <li>
            <Link to="/perfil">
              <Icone nome="user" className="w-4 h-4" />
              Meu perfil
            </Link>
          </li>
          {pode('configuracoes') && (
            <li>
              <Link to="/configuracoes">
                <Icone nome="cog" className="w-4 h-4" />
                Configurações
              </Link>
            </li>
          )}
          <li>
            <button type="button" className="text-error" onClick={sair}>
              <Icone nome="logout" className="w-4 h-4" />
              Sair
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
