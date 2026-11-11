import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutApp from './components/layout/LayoutApp.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import { AvisosProvider } from './contexts/AvisosContext.jsx';
import { SessaoProvider } from './contexts/SessaoContext.jsx';
import { TemaProvider } from './contexts/TemaContext.jsx';
import Login from './pages/autenticacao/Login.jsx';
import AcessoNegado from './pages/erros/AcessoNegado.jsx';
import NaoEncontrada from './pages/erros/NaoEncontrada.jsx';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'));

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
