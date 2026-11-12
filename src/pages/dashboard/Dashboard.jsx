import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { listarEmpresas } from '../../services/empresasService.js';
import { nomeExibido } from '../empresas/consultaEmpresas.js';
import { GraficoBarras, GraficoLinhas, GraficoRosca } from './Graficos.jsx';
import { INTERACOES_POR_MES, calcularIndicadores, contarPor } from './indicadores.js';

function Indicador({ titulo, valor, detalhe, icone, tom = 'text-primary' }) {
  return (
    <div className="cartao">
      <div className="card-body p-5 gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-70">{titulo}</span>
          <span className={tom}>
            <Icone nome={icone} />
          </span>
        </div>
        <div className="text-3xl font-bold font-display tabnum">{valor}</div>
        <div className="text-xs opacity-70">{detalhe}</div>
      </div>
    </div>
  );
}

function Cartao({ titulo, legenda, acao, className = '', children }) {
  return (
    <section className={`cartao min-w-0 ${className}`}>
      <div className="card-body p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="card-title text-base">{titulo}</h2>
          {legenda && <span className="text-xs texto-suave">{legenda}</span>}
          {acao}
        </div>
        {children}
      </div>
    </section>
  );
}

const TAREFAS = [
  ['Enviar termo de parceria', 'AgroVale', 'hoje'],
  ['Agendar banca de graduação', 'Nexa Sensores', 'amanhã'],
  ['Cobrar indicadores do 3º trimestre', '6 empresas', '14/11'],
];

const hojePorExtenso = () =>
  new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Dashboard() {
  useMigalhas([{ rotulo: 'Dashboard' }]);
  const { usuario, pode } = useSessao();
  const [empresas, setEmpresas] = useState(null);

  useEffect(() => {
    listarEmpresas().then(setEmpresas);
  }, []);

  const indicadores = useMemo(() => (empresas ? calcularIndicadores(empresas) : null), [empresas]);
  const primeiroNome = usuario.nome.replace(/^Profa?\.\s*/, '').split(' ')[0];

  return (
    <>
      <CabecalhoPagina titulo={`Olá, ${primeiroNome}`} subtitulo={`Resumo do parque em ${hojePorExtenso()}.`}>
        {pode('empresas', 'C') && (
          <Link to="/empresas/nova" className="btn btn-primary btn-sm">
            <Icone nome="plus" className="w-4 h-4" />
            Nova empresa
          </Link>
        )}
      </CabecalhoPagina>

      {!indicadores ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton h-32 rounded-box" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador titulo="Empresas ativas no parque" valor={indicadores.ativas} detalhe={`${empresas.length - indicadores.ativas} desativadas no histórico`} icone="building" />
            <Indicador titulo="Incubadas" valor={indicadores.incubadas} detalhe={indicadores.preIncubadas === 1 ? '1 pré-incubada aguardando banca' : `${indicadores.preIncubadas} pré-incubadas aguardando banca`} icone="target" tom="text-secondary" />
            <Indicador titulo="Parceiros e investidores" valor={indicadores.parceiras} detalhe="parceiras, investidores e instituições" icone="users" tom="text-info" />
            <Indicador titulo="Sem acompanhamento" valor={indicadores.semAcompanhamento.length} detalhe="sem interação há mais de 30 dias" icone="clock" tom="text-warning" />
          </div>

          <div className="grid gap-4 mt-4 grid-cols-1 xl:grid-cols-3">
            <Cartao titulo="Interações registradas por mês" legenda="reuniões e mentorias (dados de exemplo)" className="xl:col-span-2">
              <GraficoLinhas
                meses={INTERACOES_POR_MES.meses}
                series={[
                  { nome: 'Reuniões', valores: INTERACOES_POR_MES.reunioes },
                  { nome: 'Mentorias', valores: INTERACOES_POR_MES.mentorias },
                ]}
                rotulo="Gráfico de linhas: interações registradas por mês"
              />
            </Cartao>
            <Cartao titulo="Empresas por categoria">
              <GraficoRosca itens={contarPor(empresas, 'categoria')} rotulo="Gráfico de rosca: empresas ativas por categoria" />
            </Cartao>
          </div>

          <div className="grid gap-4 mt-4 grid-cols-1 xl:grid-cols-3">
            <Cartao titulo="Empresas por setor">
              <GraficoBarras itens={contarPor(empresas, 'setor')} rotulo="Gráfico de barras: empresas ativas por setor" />
            </Cartao>
            <Cartao titulo="Sem acompanhamento" acao={<Link to="/empresas?ordem=ultima&dir=desc" className="link link-primary text-xs">ver todas</Link>}>
              {indicadores.semAcompanhamento.length ? (
                <ul className="divide-y divide-base-300">
                  {indicadores.semAcompanhamento.map((e) => (
                    <li key={e.id}>
                      <Link to={`/empresas/${e.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{nomeExibido(e)}</div>
                          <div className="text-xs texto-suave">{e.categoria}</div>
                        </div>
                        <span className={`badge badge-sm tabnum ${e.diasSemInteracao > 60 ? 'badge-error' : 'badge-warning'}`}>{e.diasSemInteracao} dias</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm opacity-70 py-4">Todas as empresas ativas tiveram interação no último mês.</p>
              )}
            </Cartao>
            <Cartao titulo="Minhas tarefas">
              <ul className="divide-y divide-base-300">
                {TAREFAS.map(([titulo, empresa, prazo]) => (
                  <li key={titulo} className="flex items-start gap-3 py-2">
                    <input type="checkbox" className="checkbox checkbox-sm checkbox-primary mt-0.5" aria-label={`Concluir: ${titulo}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{titulo}</div>
                      <div className="text-xs texto-suave">{empresa}</div>
                    </div>
                    <span className="text-xs opacity-70 whitespace-nowrap">{prazo}</span>
                  </li>
                ))}
              </ul>
            </Cartao>
          </div>
        </>
      )}
    </>
  );
}
