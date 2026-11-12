import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutApp from './components/layout/LayoutApp.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import { AvisosProvider } from './contexts/AvisosContext.jsx';
import { SessaoProvider } from './contexts/SessaoContext.jsx';
import { TemaProvider } from './contexts/TemaContext.jsx';
import Login from './pages/autenticacao/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import AcessoNegado from './pages/erros/AcessoNegado.jsx';
import NaoEncontrada from './pages/erros/NaoEncontrada.jsx';

const ListaEmpresas = lazy(() => import('./pages/empresas/ListaEmpresas.jsx'));
const FormularioEmpresa = lazy(() => import('./pages/empresas/FormularioEmpresa.jsx'));
const FichaEmpresa = lazy(() => import('./pages/empresas/FichaEmpresa.jsx'));
const ListaUsuarios = lazy(() => import('./pages/usuarios/ListaUsuarios.jsx'));
const FormularioUsuario = lazy(() => import('./pages/usuarios/FormularioUsuario.jsx'));
const Permissoes = lazy(() => import('./pages/permissoes/Permissoes.jsx'));
const Relatorios = lazy(() => import('./pages/relatorios/Relatorios.jsx'));
const Configuracoes = lazy(() => import('./pages/configuracoes/Configuracoes.jsx'));
const MeuPerfil = lazy(() => import('./pages/perfil/MeuPerfil.jsx'));

function Carregando() {
  return (
    <div className="grid place-items-center py-24" role="status" aria-label="Carregando">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <TemaProvider>
      <SessaoProvider>
        <AvisosProvider>
          <BrowserRouter>
            <Suspense fallback={<Carregando />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/acesso-negado" element={<AcessoNegado />} />
                <Route element={<RotaProtegida />}>
                  <Route element={<LayoutApp />}>
                    <Route index element={<RotaProtegida modulo="dashboard"><Dashboard /></RotaProtegida>} />
                    <Route path="empresas">
                      <Route index element={<RotaProtegida modulo="empresas"><ListaEmpresas /></RotaProtegida>} />
                      <Route path="nova" element={<RotaProtegida modulo="empresas" acao="C"><FormularioEmpresa key="nova" /></RotaProtegida>} />
                      <Route path=":id" element={<RotaProtegida modulo="empresas"><FichaEmpresa /></RotaProtegida>} />
                      <Route path=":id/editar" element={<RotaProtegida modulo="empresas" acao="E"><FormularioEmpresa key="editar" /></RotaProtegida>} />
                    </Route>
                    <Route path="usuarios">
                      <Route index element={<RotaProtegida modulo="usuarios"><ListaUsuarios /></RotaProtegida>} />
                      <Route path="novo" element={<RotaProtegida modulo="usuarios" acao="C"><FormularioUsuario key="novo" /></RotaProtegida>} />
                      <Route path=":id/editar" element={<RotaProtegida modulo="usuarios" acao="E"><FormularioUsuario key="editar" /></RotaProtegida>} />
                    </Route>
                    <Route path="permissoes" element={<RotaProtegida modulo="permissoes"><Permissoes /></RotaProtegida>} />
                    <Route path="relatorios" element={<RotaProtegida modulo="relatorios"><Relatorios /></RotaProtegida>} />
                    <Route path="configuracoes" element={<RotaProtegida modulo="configuracoes"><Configuracoes /></RotaProtegida>} />
                    <Route path="perfil" element={<MeuPerfil />} />
                  </Route>
                </Route>
                <Route path="*" element={<NaoEncontrada />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AvisosProvider>
      </SessaoProvider>
    </TemaProvider>
  );
}
