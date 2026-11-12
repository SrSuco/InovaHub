import { useEffect, useState } from 'react';
import Icone from '../../components/Icone.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { listarEmpresas } from '../../services/empresasService.js';
import { contarPor } from '../dashboard/indicadores.js';

const RELATORIOS = [
  { id: 'categoria', titulo: 'Empresas por categoria', descricao: 'Quantas empresas ativas há em cada fase do parque.', campo: 'categoria' },
  { id: 'setor', titulo: 'Empresas por setor', descricao: 'Distribuição das empresas ativas por área de atuação.', campo: 'setor' },
  { id: 'cidade', titulo: 'Empresas por cidade', descricao: 'Onde ficam as empresas ativas do ecossistema.', campo: 'cidade' },
];

export default function Relatorios() {
  useMigalhas([{ rotulo: 'Análises' }, { rotulo: 'Relatórios' }]);
  const { pode } = useSessao();
  const { avisar } = useAvisos();
  const [empresas, setEmpresas] = useState([]);
  const [selecionado, setSelecionado] = useState(RELATORIOS[0]);
  const [periodo, setPeriodo] = useState('Este ano');

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch((erro) => avisar(erro.message, 'erro'));
  }, []);

  const linhas = contarPor(empresas, selecionado.campo);
  const total = linhas.reduce((soma, [, n]) => soma + n, 0);

  return (
    <>
      <CabecalhoPagina titulo="Relatórios" subtitulo="Escolha um relatório, confira a prévia e exporte quando precisar.">
        <select className="select select-bordered select-sm" aria-label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option>Este ano</option>
          <option>Últimos 6 meses</option>
          <option>Últimos 30 dias</option>
        </select>
      </CabecalhoPagina>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <ul className="flex flex-col gap-3 min-w-0">
          {RELATORIOS.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={`cartao w-full text-left transition ${selecionado.id === r.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
                aria-pressed={selecionado.id === r.id}
                onClick={() => setSelecionado(r)}
              >
                <div className="card-body p-4 gap-1">
                  <span className="font-semibold flex items-center gap-2">
                    <Icone nome="file" className="w-4 h-4 text-primary" />
                    {r.titulo}
                  </span>
                  <span className="text-xs opacity-70">{r.descricao}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <section className="cartao xl:col-span-2 min-w-0">
          <div className="card-body p-5 gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="card-title text-base">{selecionado.titulo}</h2>
                <p className="text-xs texto-suave">Prévia · {periodo} · {total} empresas ativas</p>
              </div>
              {pode('relatorios', 'P') && (
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => avisar(`"${selecionado.titulo}" exportado em PDF.`, 'info')}>
                    <Icone nome="download" className="w-4 h-4" />
                    PDF
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => avisar(`"${selecionado.titulo}" exportado em Excel.`, 'info')}>
                    <Icone nome="download" className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-right">Empresas</th>
                    <th className="w-1/2">Participação</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map(([nome, n]) => (
                    <tr key={nome}>
                      <td>{nome}</td>
                      <td className="text-right tabnum">{n}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <progress className="progress progress-primary flex-1" value={n} max={total} aria-label={`${nome}: ${n} de ${total}`} />
                          <span className="text-xs tabnum w-10 text-right">{total ? Math.round((n / total) * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
