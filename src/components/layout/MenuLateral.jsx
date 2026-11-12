import { Link, NavLink } from 'react-router-dom';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { iniciais } from '../../data/usuarios.js';
import Icone from '../Icone.jsx';
import Logo from '../Logo.jsx';
import { MENU } from './menu.js';

export default function MenuLateral({ aoNavegar }) {
  const { usuario, perfil, pode, sair } = useSessao();

  const visivel = (item) => item.emBreve || pode(item.modulo);
  const ocultos = MENU.flatMap((g) => g.itens).filter((i) => !visivel(i)).length;
  const grupos = MENU.map((g) => ({ ...g, itens: g.itens.filter(visivel) })).filter((g) => g.itens.length);

  const classeLink = ({ isActive }) => `gap-3 ${isActive ? 'active' : ''}`;

  return (
    <aside className="bg-base-100 border-r border-base-300 w-72 min-h-full flex flex-col">
      <Link to="/" className="flex items-center px-5 h-16 border-b border-base-300" onClick={aoNavegar}>
        <Logo subtitulo="CRM do InovaParq · UNIVILLE" />
      </Link>

      <nav aria-label="Menu principal" className="flex-1">
        <ul className="menu px-3 py-2 gap-0.5 text-sm">
          {grupos.map((grupo) => (
            <li key={grupo.titulo} className="contents">
              <span className="menu-title text-[11px] uppercase tracking-wider pt-4">{grupo.titulo}</span>
              <ul className="ml-0 pl-0 before:hidden">
                {grupo.itens.map((item) =>
                  item.emBreve ? (
                    <li key={item.nome} className="disabled">
                      <span className="gap-3">
                        <Icone nome={item.icone} />
                        {item.nome}
                        <span className="badge badge-ghost badge-sm ml-auto">em breve</span>
                      </span>
                    </li>
                  ) : (
                    <li key={item.rota}>
                      <NavLink to={item.rota} end={item.exato} className={classeLink} onClick={aoNavegar}>
                        <Icone nome={item.icone} />
                        {item.nome}
                      </NavLink>
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
          <li className="contents">
            <span className="menu-title text-[11px] uppercase tracking-wider pt-4">Sistema</span>
            <ul className="ml-0 pl-0 before:hidden">
              <li>
                <NavLink to="/perfil" className={classeLink} onClick={aoNavegar}>
                  <Icone nome="user" />
                  Meu perfil
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
        {ocultos > 0 && (
          <p className="px-7 pb-3 text-xs texto-suave flex items-center gap-2">
            <Icone nome="eyeoff" className="w-4 h-4" />
            {ocultos} {ocultos > 1 ? 'itens ocultos' : 'item oculto'} pelo perfil {perfil}
          </p>
        )}
      </nav>

      <div className="border-t border-base-300 p-3">
        <div className="flex items-center gap-3 p-2">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content w-10 rounded-full">
              <span className="text-sm font-semibold">{iniciais(usuario.nome)}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{usuario.nome}</div>
            <div className="text-xs texto-suave">{perfil}</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" title="Sair" aria-label="Sair do sistema" onClick={sair}>
            <Icone nome="logout" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
