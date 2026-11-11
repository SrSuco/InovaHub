import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import Icone from '../Icone.jsx';
import BarraSuperior from './BarraSuperior.jsx';
import MenuLateral from './MenuLateral.jsx';

const MigalhasContext = createContext(() => {});
const ID_GAVETA = 'gaveta-menu';

/**
 * Define as "migalhas de pão" (breadcrumb) da página atual.
 * Ex.: useMigalhas([{ rotulo: 'Cadastros' }, { rotulo: 'Empresas' }])
 */
export function useMigalhas(migalhas) {
  const definir = useContext(MigalhasContext);
  const chave = JSON.stringify(migalhas);
  useEffect(() => {
    definir(JSON.parse(chave));
  }, [chave, definir]);
}

/** Moldura das telas internas: menu lateral, barra superior, conteúdo e rodapé. */
export default function LayoutApp() {
  const { perfil, somenteLeitura } = useSessao();
  const [migalhas, setMigalhas] = useState([]);
  const [gavetaAberta, setGavetaAberta] = useState(false);

  return (
    <MigalhasContext.Provider value={setMigalhas}>
      <div className="drawer lg:drawer-open">
        <input
          id={ID_GAVETA}
          type="checkbox"
          className="drawer-toggle"
          checked={gavetaAberta}
          onChange={(e) => setGavetaAberta(e.target.checked)}
        />
        <div className="drawer-content flex flex-col min-w-0 min-h-screen bg-base-200">
          <BarraSuperior migalhas={migalhas} idGaveta={ID_GAVETA} />
          <main className="gutter py-6 flex-1 w-full max-w-[1440px] mx-auto">
            {somenteLeitura && (
              <div role="status" className="alert text-sm mb-5">
                <Icone nome="lock" />
                <span>
                  Seu perfil <b>{perfil}</b> é <b>somente leitura</b>. Você pode consultar as informações, mas não alterá-las.
                </span>
              </div>
            )}
            <Outlet />
          </main>
          <footer className="gutter py-4 text-xs opacity-60 flex flex-wrap gap-2 justify-between border-t border-base-300 bg-base-100">
            <span>InovaHub v{__VERSAO__}</span>
            <span>InovaParq · Parque de Inovação da UNIVILLE · Joinville/SC</span>
          </footer>
        </div>
        <div className="drawer-side z-30">
          <label htmlFor={ID_GAVETA} aria-label="Fechar menu" className="drawer-overlay" />
          <MenuLateral aoNavegar={() => setGavetaAberta(false)} />
        </div>
      </div>
    </MigalhasContext.Provider>
  );
}
