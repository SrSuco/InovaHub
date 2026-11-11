import { Link, useNavigate } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import Logo from '../../components/Logo.jsx';

/** Base visual das páginas de erro (404 e 403). */
export default function PaginaErro({ codigo, icone, titulo, texto, acaoPrincipal }) {
  const navegar = useNavigate();
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="gutter h-16 flex items-center">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 grid place-items-center gutter py-10">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 text-primary grid place-items-center">
            <Icone nome={icone} className="w-10 h-10" />
          </div>
          <p className="font-display font-extrabold text-6xl text-primary tabnum">{codigo}</p>
          <h1 className="text-2xl font-bold mt-2">{titulo}</h1>
          <p className="opacity-70 mt-3">{texto}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button type="button" className="btn btn-ghost" onClick={() => navegar(-1)}>
              <Icone nome="arrowL" className="w-4 h-4" />
              Voltar
            </button>
            <Link to={acaoPrincipal.rota} className="btn btn-primary">
              {acaoPrincipal.rotulo}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
