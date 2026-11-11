import { useState } from 'react';
import Icone from '../../components/Icone.jsx';
import Campo, { classeInput } from '../../components/formulario/Campo.jsx';
import CabecalhoPagina from '../../components/layout/CabecalhoPagina.jsx';
import { useMigalhas } from '../../components/layout/LayoutApp.jsx';
import { useAvisos } from '../../contexts/AvisosContext.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import { ACOES, MODULOS, badgeDoPerfil } from '../../data/permissoes.js';
import { iniciais } from '../../data/usuarios.js';
import { alterarSenha, atualizarMeuPerfil } from '../../services/usuariosService.js';
import { mascararTelefone } from '../../utils/mascaras.js';
import { telefoneValido } from '../../utils/validacao.js';
import { validarNovaSenha } from './validacaoSenha.js';

export default function MeuPerfil() {
  useMigalhas([{ rotulo: 'Sistema' }, { rotulo: 'Meu perfil' }]);
  const { usuario, perfil, pode, atualizarUsuarioLogado } = useSessao();
  const { avisar } = useAvisos();
  const [dados, setDados] = useState({ nome: usuario.nome, cargo: usuario.cargo ?? '', telefone: usuario.telefone ?? '' });
  const [errosDados, setErrosDados] = useState({});
  const [senha, setSenha] = useState({ atual: '', nova: '', confirmacao: '' });
  const [errosSenha, setErrosSenha] = useState({});

  async function salvarDados(e) {
    e.preventDefault();
    const erros = {};
    if (dados.nome.trim().length < 3) erros.nome = 'Informe seu nome.';
    if (dados.telefone && !telefoneValido(dados.telefone)) erros.telefone = 'Telefone inválido. Use DDD e número.';
    setErrosDados(erros);
    if (Object.keys(erros).length) return;
    try {
      await atualizarMeuPerfil(usuario, dados);
      atualizarUsuarioLogado(dados);
      avisar('Seus dados foram atualizados.');
    } catch (erro) {
      if (erro.campos) setErrosDados(erro.campos);
      else avisar(erro.message, 'erro');
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    const erros = validarNovaSenha(senha);
    setErrosSenha(erros);
    if (Object.keys(erros).length) return;
    try {
      await alterarSenha(senha);
      setSenha({ atual: '', nova: '', confirmacao: '' });
      avisar('Senha alterada. Use a nova senha no próximo acesso.');
    } catch (erro) {
      if (erro.campos) setErrosSenha(erro.campos);
      else avisar(erro.message, 'erro');
    }
  }

  return (
    <>
      <CabecalhoPagina titulo="Meu perfil" subtitulo="Seus dados, sua senha e o que você pode fazer no InovaHub." />
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
          <form className="cartao" onSubmit={salvarDados} noValidate>
            <div className="card-body p-5 gap-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content w-16 rounded-full">
                    <span className="text-xl font-semibold">{iniciais(usuario.nome)}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-lg truncate">{usuario.nome}</div>
                  <div className="text-sm opacity-70 truncate">{usuario.email}</div>
                </div>
              </div>
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                <Campo id="perfil-nome" rotulo="Nome" obrigatorio erro={errosDados.nome}>
                  {(a11y) => <input {...a11y} className={classeInput(errosDados.nome)} value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} />}
                </Campo>
                <Campo id="perfil-email" rotulo="E-mail" ajuda="Para trocar o e-mail, fale com o administrador.">
                  {(a11y) => <input {...a11y} className={classeInput()} value={usuario.email} readOnly />}
                </Campo>
                <Campo id="perfil-cargo" rotulo="Cargo">
                  {(a11y) => <input {...a11y} className={classeInput()} value={dados.cargo} onChange={(e) => setDados({ ...dados, cargo: e.target.value })} />}
                </Campo>
                <Campo id="perfil-telefone" rotulo="Telefone" erro={errosDados.telefone}>
                  {(a11y) => <input {...a11y} type="tel" className={classeInput(errosDados.telefone)} value={dados.telefone} onChange={(e) => setDados({ ...dados, telefone: mascararTelefone(e.target.value) })} />}
                </Campo>
              </div>
              <div className="flex justify-end mt-3">
                <button type="submit" className="btn btn-primary btn-sm">Salvar dados</button>
              </div>
            </div>
          </form>

          <form className="cartao" onSubmit={trocarSenha} noValidate>
            <div className="card-body p-5 gap-1">
              <h2 className="card-title text-base">Trocar senha</h2>
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-3">
                {[
                  ['atual', 'Senha atual', 'current-password'],
                  ['nova', 'Nova senha', 'new-password'],
                  ['confirmacao', 'Confirmar nova senha', 'new-password'],
                ].map(([campo, rotulo, auto]) => (
                  <Campo key={campo} id={`senha-${campo}`} rotulo={rotulo} obrigatorio erro={errosSenha[campo]}>
                    {(a11y) => <input {...a11y} type="password" autoComplete={auto} className={classeInput(errosSenha[campo])} value={senha[campo]} onChange={(e) => setSenha({ ...senha, [campo]: e.target.value })} />}
                  </Campo>
                ))}
              </div>
              <p className="text-xs opacity-60 mt-1">Use pelo menos 8 caracteres, misturando letras e números.</p>
              <div className="flex justify-end mt-3">
                <button type="submit" className="btn btn-outline btn-sm">Trocar senha</button>
              </div>
            </div>
          </form>
        </div>

        <aside className="cartao h-max min-w-0">
          <div className="card-body p-5 gap-3">
            <h2 className="card-title text-base">
              <Icone nome="shieldok" className="w-5 h-5 text-primary" />
              Meu acesso
            </h2>
            <div className="text-sm">
              Perfil <span className={`badge badge-sm ${badgeDoPerfil(perfil)}`}>{perfil}</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {MODULOS.map((m) => {
                const acoes = ACOES.filter((a) => m.acoes.includes(a.id) && pode(m.id, a.id)).map((a) => a.nome.toLowerCase());
                return (
                  <li key={m.id} className={`flex gap-2 ${acoes.length ? '' : 'opacity-50'}`}>
                    <Icone nome={acoes.length ? 'check' : 'x'} className={`w-4 h-4 mt-0.5 ${acoes.length ? 'text-success' : ''}`} />
                    <span>
                      <b>{m.nome}</b>
                      {acoes.length ? `: ${acoes.join(', ')}` : ': sem acesso'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
