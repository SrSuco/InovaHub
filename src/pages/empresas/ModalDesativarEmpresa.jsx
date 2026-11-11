import { useEffect, useState } from 'react';
import Campo, { classeInput, classeSelect, classeTextarea } from '../../components/formulario/Campo.jsx';
import Modal from '../../components/Modal.jsx';
import { MOTIVOS_DESATIVACAO } from '../../data/opcoesEmpresa.js';
import { desativarEmpresa } from '../../services/empresasService.js';
import { nomeExibido } from './consultaEmpresas.js';

const hoje = () => new Date().toISOString().slice(0, 10);

/** Confirmação de desativação. Empresas nunca são excluídas, só desativadas. */
export default function ModalDesativarEmpresa({ empresa, aoFechar, aoConcluir }) {
  const [motivo, setMotivo] = useState('');
  const [dataSaida, setDataSaida] = useState(hoje());
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (empresa) {
      setMotivo('');
      setDataSaida(hoje());
      setObservacao('');
      setErro('');
    }
  }, [empresa]);

  async function confirmar() {
    if (!motivo) {
      setErro('Escolha o motivo da desativação.');
      document.getElementById('desativar-motivo')?.focus();
      return;
    }
    setEnviando(true);
    try {
      await desativarEmpresa(empresa.id, { motivo, dataSaida, observacao });
      aoConcluir(empresa);
    } catch (falha) {
      setErro(falha.campos?.motivo ?? falha.campos?.dataSaida ?? falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      aberto={Boolean(empresa)}
      aoFechar={aoFechar}
      titulo={empresa ? `Desativar ${nomeExibido(empresa)}?` : ''}
      acoes={
        <>
          <button type="button" className="btn btn-ghost" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="button" className="btn btn-error" onClick={confirmar} disabled={enviando}>
            {enviando && <span className="loading loading-spinner loading-sm" />}
            Desativar empresa
          </button>
        </>
      }
    >
      <p className="text-sm opacity-80 mt-2">
        Empresas não são excluídas da base. A empresa sai das listas e indicadores de ativas, mas os dados, contatos e o
        histórico de interações continuam guardados, e dá para reativar depois.
      </p>
      <div className="grid gap-2 mt-4">
        <Campo id="desativar-motivo" rotulo="Motivo" obrigatorio erro={erro}>
          {(a11y) => (
            <select
              {...a11y}
              className={classeSelect(erro)}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErro('');
              }}
            >
              <option value="">Selecione</option>
              {MOTIVOS_DESATIVACAO.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          )}
        </Campo>
        <Campo id="desativar-data" rotulo="Data de saída">
          {(a11y) => (
            <input {...a11y} type="date" className={classeInput()} max={hoje()} value={dataSaida} onChange={(e) => setDataSaida(e.target.value)} />
          )}
        </Campo>
        <Campo id="desativar-obs" rotulo="Observação">
          {(a11y) => (
            <textarea
              {...a11y}
              className={classeTextarea()}
              rows={3}
              placeholder="Opcional"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          )}
        </Campo>
      </div>
    </Modal>
  );
}
