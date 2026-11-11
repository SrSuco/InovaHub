import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';

export default function Dashboard() {
  const { usuario } = useSessao();
  useMigalhas([{ rotulo: 'Dashboard' }]);
  return <CabecalhoPagina titulo={`Olá, ${usuario.nome.split(' ')[0]}`} subtitulo="O painel de indicadores chega na próxima versão." />;
}
