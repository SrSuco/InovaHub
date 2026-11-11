import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessao } from '../contexts/SessaoContext.jsx';

/**
 * Protege rotas internas.
 * - Sem sessão: manda para o login, lembrando a página pedida.
 * - Sem permissão para o módulo/ação: manda para "acesso negado".
 */
export default function RotaProtegida({ modulo, acao = 'V', children }) {
  const { usuario, pode } = useSessao();
  const local = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname + local.search }} />;
  if (modulo && !pode(modulo, acao)) return <Navigate to="/acesso-negado" replace />;
  return children ?? <Outlet />;
}
