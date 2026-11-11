import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTema } from '../../contexts/TemaContext.jsx';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Legend, Tooltip);

/** Lê as cores atuais do tema (variáveis OKLCH do DaisyUI) para usar nos gráficos. */
function useCoresDoTema() {
  const { escuro, destaque } = useTema();
  const [cores, setCores] = useState(null);

  useEffect(() => {
    const estilo = getComputedStyle(document.documentElement);
    const cor = (variavel, alfa = 1) => `oklch(${estilo.getPropertyValue(variavel).trim()} / ${alfa})`;
    setCores({
      primaria: cor('--p'),
      primariaSuave: cor('--p', 0.15),
      secundaria: cor('--s'),
      destaque: cor('--a'),
      info: cor('--in'),
      aviso: cor('--wa'),
      neutra: cor('--n', 0.55),
      erro: cor('--er', 0.8),
      texto: cor('--bc', 0.7),
      grade: cor('--bc', 0.1),
      fundo: cor('--b1'),
    });
  }, [escuro, destaque]);

  return cores;
}

function opcoesBase(cores) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: cores.texto, boxWidth: 12, usePointStyle: true } },
      tooltip: { mode: 'index', intersect: false },
    },
  };
}

const eixos = (cores) => ({
  x: { ticks: { color: cores.texto }, grid: { display: false } },
  y: { beginAtZero: true, ticks: { color: cores.texto, precision: 0 }, grid: { color: cores.grade } },
});

export function GraficoLinhas({ meses, series, rotulo }) {
  const cores = useCoresDoTema();
  if (!cores) return null;
  const paleta = [cores.primaria, cores.secundaria];
  const dados = {
    labels: meses,
    datasets: series.map((s, i) => ({
      label: s.nome,
      data: s.valores,
      borderColor: paleta[i],
      backgroundColor: i === 0 ? cores.primariaSuave : 'transparent',
      fill: i === 0,
      tension: 0.35,
      pointRadius: 3,
    })),
  };
  return (
    <div className="relative h-60">
      <Line data={dados} options={{ ...opcoesBase(cores), scales: eixos(cores) }} aria-label={rotulo} role="img" />
    </div>
  );
}

export function GraficoRosca({ itens, rotulo }) {
  const cores = useCoresDoTema();
  if (!cores) return null;
  const paleta = [cores.primaria, cores.secundaria, cores.destaque, cores.info, cores.aviso, cores.neutra, cores.erro ?? cores.texto, cores.texto];
  const dados = {
    labels: itens.map(([nome]) => nome),
    datasets: [{ data: itens.map(([, n]) => n), backgroundColor: paleta, borderColor: cores.fundo, borderWidth: 2 }],
  };
  return (
    <div className="relative h-60">
      <Doughnut data={dados} options={{ ...opcoesBase(cores), cutout: '62%' }} aria-label={rotulo} role="img" />
    </div>
  );
}

export function GraficoBarras({ itens, rotulo }) {
  const cores = useCoresDoTema();
  if (!cores) return null;
  const dados = {
    labels: itens.map(([nome]) => nome),
    datasets: [{ label: 'Empresas', data: itens.map(([, n]) => n), backgroundColor: cores.primaria, borderRadius: 6, maxBarThickness: 32 }],
  };
  const opcoes = { ...opcoesBase(cores), plugins: { ...opcoesBase(cores).plugins, legend: { display: false } }, scales: eixos(cores) };
  return (
    <div className="relative h-60">
      <Bar data={dados} options={opcoes} aria-label={rotulo} role="img" />
    </div>
  );
}
