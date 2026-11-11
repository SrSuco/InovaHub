import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import Campo, { classeInput, classeSelect, classeTextarea } from '../../components/formulario/Campo.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import Modal from '../../components/Modal.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { CATEGORIAS, PORTES, SETORES } from '../../data/opcoesEmpresa.js';
import {
  ErroValidacao,
  atualizarEmpresa,
  consultarCep,
  consultarCnpj,
  criarEmpresa,
  obterEmpresa,
} from '../../services/empresasService.js';
import { responsaveisDisponiveis } from '../../services/usuariosService.js';
import { mascararCep, mascararCnpj, mascararTelefone } from '../../utils/mascaras.js';
import { UFS } from '../../utils/validacao.js';
import { nomeExibido } from './consultaEmpresas.js';
import { EMPRESA_VAZIA, ROTULOS, validarCampo, validarEmpresa } from './validacaoEmpresa.js';

const MASCARAS = { cnpj: mascararCnpj, cep: mascararCep, telefone: mascararTelefone };
const idCampo = (campo) => `empresa-${campo}`;

function Secao({ titulo, descricao, children }) {
  return (
    <section className="cartao">
      <div className="card-body p-5 gap-1">
        <h2 className="card-title text-base">{titulo}</h2>
        {descricao && <p className="text-xs opacity-70">{descricao}</p>}
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 mt-2">{children}</div>
      </div>
    </section>
  );
}

/** Cadastro (rota /empresas/nova) e edição (rota /empresas/:id/editar) de empresas. */
export default function FormularioEmpresa() {
  const { id } = useParams();
  const modo = id ? 'editar' : 'nova';
  const navegar = useNavigate();
  const { avisar } = useAvisos();
  const responsaveis = useMemo(() => responsaveisDisponiveis(), []);

  const [dados, setDados] = useState(EMPRESA_VAZIA);
  const [original, setOriginal] = useState(EMPRESA_VAZIA);
  const [erros, setErros] = useState({});
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [carregando, setCarregando] = useState(modo === 'editar');
  const [salvando, setSalvando] = useState(false);
  const [buscando, setBuscando] = useState('');
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const resumoRef = useRef(null);

  useMigalhas([
    { rotulo: 'Cadastros' },
    { rotulo: 'Empresas', rota: '/empresas' },
    { rotulo: modo === 'nova' ? 'Nova empresa' : 'Editar empresa' },
  ]);

  useEffect(() => {
    if (modo !== 'editar') return;
    obterEmpresa(id)
      .then((empresa) => {
        if (empresa.situacao === 'Desativada') {
          avisar('Reative a empresa antes de editar.', 'info');
          navegar(`/empresas/${id}`, { replace: true });
          return;
        }
        const valores = { ...EMPRESA_VAZIA, ...empresa };
        setDados(valores);
        setOriginal(valores);
        setCarregando(false);
      })
      .catch(() => navegar('/pagina-nao-encontrada', { replace: true }));
  }, [id, modo, navegar, avisar]);

  const alterado = JSON.stringify(dados) !== JSON.stringify(original);

  function alterar(campo, valor) {
    const final = MASCARAS[campo] ? MASCARAS[campo](valor) : valor;
    setDados((atual) => ({ ...atual, [campo]: final }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: validarCampo(campo, final, modo) }));
  }

  /** Validação ao sair do campo. */
  const aoSair = (campo) => () => {
    const erro = validarCampo(campo, dados[campo], modo);
    setErros((atual) => ({ ...atual, [campo]: erro }));
  };

  async function buscarCnpj() {
    const erro = validarCampo('cnpj', dados.cnpj, 'nova');
    if (erro) {
      setErros((atual) => ({ ...atual, cnpj: erro }));
      return;
    }
    setBuscando('cnpj');
    try {
      const encontrados = await consultarCnpj(dados.cnpj);
      setDados((atual) => ({ ...atual, ...encontrados }));
      avisar('Dados preenchidos com a base pública da Receita Federal. Confira antes de salvar.', 'info');
    } catch (e) {
      avisar(e.message, 'info');
    } finally {
      setBuscando('');
    }
  }

  async function buscarCep() {
    const erro = validarCampo('cep', dados.cep) || (!dados.cep && 'Informe o CEP para buscar.');
    if (erro) {
      setErros((atual) => ({ ...atual, cep: erro }));
      return;
    }
    setBuscando('cep');
    try {
      const endereco = await consultarCep(dados.cep);
      setDados((atual) => ({ ...atual, ...endereco }));
      setErros((atual) => ({ ...atual, cep: null, cidade: null }));
    } catch (e) {
      setErros((atual) => ({ ...atual, cep: e.message }));
    } finally {
      setBuscando('');
    }
  }

  function exibirErros(encontrados) {
    setErros(encontrados);
    setMostrarResumo(true);
    requestAnimationFrame(() => resumoRef.current?.focus());
  }

  async function salvar(evento) {
    evento.preventDefault();
    const encontrados = validarEmpresa(dados, modo);
    if (Object.keys(encontrados).length) {
      exibirErros(encontrados);
      return;
    }
    setSalvando(true);
    try {
      const salva = modo === 'nova' ? await criarEmpresa(dados) : await atualizarEmpresa(id, dados);
      avisar(modo === 'nova' ? `${nomeExibido(salva)} foi cadastrada.` : 'Alterações salvas.');
      setOriginal(dados);
      navegar(`/empresas/${salva.id}`);
    } catch (e) {
      if (e instanceof ErroValidacao) exibirErros(e.campos);
      else avisar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    if (alterado) setConfirmarSaida(true);
    else navegar(modo === 'nova' ? '/empresas' : `/empresas/${id}`);
  }

  if (carregando) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Carregando empresa">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const listaErros = Object.entries(erros).filter(([, msg]) => msg);

  /** Monta um campo de texto ligado ao estado do formulário. */
  const texto = (campo, rotulo, { obrigatorio, tipo = 'text', placeholder, className, ...resto } = {}) => (
    <Campo id={idCampo(campo)} rotulo={rotulo} obrigatorio={obrigatorio} erro={erros[campo]} className={className}>
      {(a11y) => (
        <input
          {...a11y}
          type={tipo}
          className={classeInput(erros[campo])}
          placeholder={placeholder}
          value={dados[campo] ?? ''}
          onChange={(e) => alterar(campo, e.target.value)}
          onBlur={aoSair(campo)}
          {...resto}
        />
      )}
    </Campo>
  );

  const selecao = (campo, rotulo, opcoes, { obrigatorio, className } = {}) => (
    <Campo id={idCampo(campo)} rotulo={rotulo} obrigatorio={obrigatorio} erro={erros[campo]} className={className}>
      {(a11y) => (
        <select {...a11y} className={classeSelect(erros[campo])} value={dados[campo] ?? ''} onChange={(e) => alterar(campo, e.target.value)} onBlur={aoSair(campo)}>
          <option value="">Selecione</option>
          {opcoes.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.valor} value={o.valor}>{o.rotulo}</option>))}
        </select>
      )}
    </Campo>
  );

  return (
    <>
      <Link to={modo === 'nova' ? '/empresas' : `/empresas/${id}`} className="btn btn-ghost btn-sm -ml-2 mb-2">
        <Icone nome="arrowL" className="w-4 h-4" />
        {modo === 'nova' ? 'Empresas' : nomeExibido(original)}
      </Link>
      <CabecalhoPagina
        titulo={modo === 'nova' ? 'Nova empresa' : `Editar ${nomeExibido(original)}`}
        subtitulo={
          modo === 'nova'
            ? 'Comece pelo CNPJ: buscamos razão social e endereço na base pública. Campos com * são obrigatórios.'
            : 'O CNPJ não pode ser alterado. Campos com * são obrigatórios.'
        }
      />

      {mostrarResumo && listaErros.length > 0 && (
        <div ref={resumoRef} tabIndex={-1} role="alert" className="alert alert-error mb-4 flex items-start text-left text-sm">
          <Icone nome="alert" />
          <div>
            <b>
              Não foi possível salvar. Corrija {listaErros.length === 1 ? 'o campo destacado' : `os ${listaErros.length} campos destacados`}:
            </b>
            <ul className="list-disc ml-5 mt-1">
              {listaErros.map(([campo, msg]) => (
                <li key={campo}>
                  <a href={`#${idCampo(campo)}`} className="underline" onClick={(e) => { e.preventDefault(); document.getElementById(idCampo(campo))?.focus(); }}>
                    {ROTULOS[campo] ?? campo}
                  </a>
                  : {msg}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={salvar} noValidate className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
          <Secao
            titulo="Identificação"
            descricao={modo === 'nova' ? 'Digite o CNPJ e clique em Buscar para preencher os dados da Receita Federal.' : undefined}
          >
            <Campo id={idCampo('cnpj')} rotulo="CNPJ" obrigatorio erro={erros.cnpj} ajuda={modo === 'editar' ? 'O CNPJ não pode ser alterado depois do cadastro.' : undefined}>
              {(a11y) => (
                <div className="flex gap-2">
                  <input
                    {...a11y}
                    className={classeInput(erros.cnpj, 'input input-bordered flex-1 min-w-0 tabnum')}
                    placeholder="00.000.000/0000-00"
                    inputMode="numeric"
                    value={dados.cnpj}
                    readOnly={modo === 'editar'}
                    onChange={(e) => alterar('cnpj', e.target.value)}
                    onBlur={aoSair('cnpj')}
                  />
                  {modo === 'nova' && (
                    <button type="button" className="btn btn-outline" onClick={buscarCnpj} disabled={buscando === 'cnpj'}>
                      {buscando === 'cnpj' ? <span className="loading loading-spinner loading-sm" /> : <Icone nome="search" className="w-4 h-4" />}
                      Buscar
                    </button>
                  )}
                </div>
              )}
            </Campo>
            {texto('inscricaoEstadual', 'Inscrição estadual', { placeholder: 'Isento ou número' })}
            {texto('razaoSocial', 'Razão social', { obrigatorio: true, placeholder: 'Ex.: Nexa Sensores Ltda.', className: 'sm:col-span-2' })}
            {texto('nomeFantasia', 'Nome fantasia', { placeholder: 'Se vazio, usamos a razão social' })}
            {texto('dataFundacao', 'Data de fundação', { tipo: 'date' })}
            {selecao('porte', 'Porte', PORTES)}
            {texto('site', 'Site', { tipo: 'url', placeholder: 'https://empresa.com.br' })}
          </Secao>

          <Secao titulo="Relação com o parque">
            {selecao('categoria', 'Categoria', CATEGORIAS, { obrigatorio: true })}
            {selecao('setor', 'Setor', SETORES, { obrigatorio: true })}
            {selecao('responsavelId', 'Responsável no parque', responsaveis.map((r) => ({ valor: r.id, rotulo: r.nome })), { obrigatorio: true })}
            {texto('dataEntrada', 'Data de entrada no parque', { tipo: 'date' })}
          </Secao>

          <Secao titulo="Contato principal" descricao="Pessoa que a equipe procura primeiro. Outros contatos ficam na ficha da empresa.">
            {texto('contatoNome', 'Nome', { obrigatorio: true, autoComplete: 'off' })}
            {texto('contatoCargo', 'Cargo')}
            {texto('email', 'E-mail', { obrigatorio: true, tipo: 'email', placeholder: 'nome@empresa.com.br' })}
            {texto('telefone', 'Telefone', { obrigatorio: true, tipo: 'tel', placeholder: '(47) 99999-0000', inputMode: 'tel' })}
          </Secao>

          <section className="cartao">
            <div className="card-body p-5 gap-1">
              <h2 className="card-title text-base">Endereço</h2>
              <div className="grid gap-x-4 gap-y-1 grid-cols-1 sm:grid-cols-6 mt-2">
                <Campo id={idCampo('cep')} rotulo="CEP" erro={erros.cep} className="sm:col-span-2">
                  {(a11y) => (
                    <div className="flex gap-2">
                      <input
                        {...a11y}
                        className={classeInput(erros.cep, 'input input-bordered flex-1 min-w-0 tabnum')}
                        placeholder="00000-000"
                        inputMode="numeric"
                        value={dados.cep}
                        onChange={(e) => alterar('cep', e.target.value)}
                        onBlur={aoSair('cep')}
                      />
                      <button type="button" className="btn btn-outline btn-square" onClick={buscarCep} aria-label="Buscar endereço pelo CEP" disabled={buscando === 'cep'}>
                        {buscando === 'cep' ? <span className="loading loading-spinner loading-sm" /> : <Icone nome="search" className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </Campo>
                {texto('logradouro', 'Logradouro', { className: 'sm:col-span-4' })}
                {texto('numero', 'Número', { className: 'sm:col-span-2' })}
                {texto('complemento', 'Complemento', { placeholder: 'Sala, bloco', className: 'sm:col-span-4' })}
                {texto('bairro', 'Bairro', { className: 'sm:col-span-2' })}
                {texto('cidade', 'Cidade', { obrigatorio: true, className: 'sm:col-span-3' })}
                {selecao('uf', 'UF', UFS, { className: 'sm:col-span-1' })}
              </div>
            </div>
          </section>

          <section className="cartao">
            <div className="card-body p-5 gap-2">
              <h2 className="card-title text-base">Observações</h2>
              <Campo id={idCampo('observacoes')} rotulo="Observações internas">
                {(a11y) => (
                  <textarea
                    {...a11y}
                    rows={4}
                    className={classeTextarea()}
                    placeholder="Informações úteis para a equipe"
                    value={dados.observacoes}
                    onChange={(e) => alterar('observacoes', e.target.value)}
                  />
                )}
              </Campo>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 min-w-0">
          <div className="cartao">
            <div className="card-body p-5 gap-2 text-sm">
              <h2 className="card-title text-base">
                <Icone nome="shieldok" className="w-5 h-5 text-primary" />
                Antes de salvar
              </h2>
              <p>O CNPJ não pode repetir: se a empresa já existe, abra o cadastro dela.</p>
              <p>Use o e-mail de quem responde pela empresa, não um e-mail genérico.</p>
              <p>A categoria define em quais relatórios a empresa aparece.</p>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row xl:flex-col-reverse gap-2 xl:sticky xl:top-20">
            <button type="button" className="btn btn-ghost flex-1" onClick={cancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={salvando}>
              {salvando && <span className="loading loading-spinner loading-sm" />}
              {modo === 'nova' ? 'Cadastrar empresa' : 'Salvar alterações'}
            </button>
          </div>
        </aside>
      </form>

      <Modal
        aberto={confirmarSaida}
        aoFechar={() => setConfirmarSaida(false)}
        titulo="Descartar as alterações?"
        acoes={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmarSaida(false)}>
              Continuar editando
            </button>
            <button type="button" className="btn btn-error" onClick={() => navegar(modo === 'nova' ? '/empresas' : `/empresas/${id}`)}>
              Descartar
            </button>
          </>
        }
      >
        <p className="text-sm opacity-80 mt-2">O que você preencheu nesta tela ainda não foi salvo e será perdido.</p>
      </Modal>
    </>
  );
}
