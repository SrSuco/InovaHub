import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MATRIZ_PADRAO, ehSomenteLeitura, temPermissao } from '../data/permissoes.js';
import { gravar, ler, remover } from '../services/armazenamento.js';
import { EVENTO_SESSAO_EXPIRADA, definirToken, usaApi } from '../services/clienteApi.js';
import { autenticar, recuperarSessao, salvarMatrizPermissoes } from '../services/usuariosService.js';

const SessaoContext = createContext(null);

/** Sessão salva com "manter conectado": { usuario, token }. */
function sessaoSalva() {
  const salva = ler('sessao', null);
  // Sessões gravadas antes da API guardavam só o usuário.
  if (salva && !salva.usuario) return { usuario: salva, token: null };
  return salva;
}

export function SessaoProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salva = sessaoSalva();
    if (usaApi && !salva?.token) return null;
    definirToken(salva?.token);
    return salva?.usuario ?? null;
  });
  const [matriz, setMatriz] = useState(() => ler('matriz', MATRIZ_PADRAO));

  const sair = useCallback(() => {
    setUsuario(null);
    definirToken(null);
    remover('sessao');
  }, []);

  // No modo API, confere o token salvo e traz usuário e permissões atualizados.
  useEffect(() => {
    if (!usaApi || !usuario) return;
    recuperarSessao()
      .then(({ usuario: atual, matriz: atualMatriz }) => {
        setUsuario(atual);
        setMatriz(atualMatriz);
      })
      .catch((erro) => {
        if (erro.status === 401) sair();
      });
    // Só ao abrir o sistema.
  }, []);

  // A API recusou o token: volta para o login.
  useEffect(() => {
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, sair);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, sair);
  }, [sair]);

  const entrar = useCallback(async (identificador, senha, manterConectado) => {
    const sessao = await autenticar(identificador, senha, manterConectado);
    definirToken(sessao.token);
    setUsuario(sessao.usuario);
    setMatriz(sessao.matriz);
    if (manterConectado) gravar('sessao', { usuario: sessao.usuario, token: sessao.token });
    else remover('sessao');
    return sessao.usuario;
  }, []);

  const atualizarUsuarioLogado = useCallback((dados) => {
    setUsuario((atual) => {
      const novo = { ...atual, ...dados };
      const salva = sessaoSalva();
      if (salva) gravar('sessao', { ...salva, usuario: novo });
      return novo;
    });
  }, []);

  const salvarMatriz = useCallback(async (nova) => {
    const gravada = await salvarMatrizPermissoes(nova);
    setMatriz(gravada);
    return gravada;
  }, []);

  const valor = useMemo(() => {
    const perfil = usuario?.perfil ?? null;
    return {
      usuario,
      perfil,
      matriz,
      entrar,
      sair,
      salvarMatriz,
      atualizarUsuarioLogado,
      pode: (modulo, acao = 'V') => temPermissao(matriz, perfil, modulo, acao),
      somenteLeitura: perfil ? ehSomenteLeitura(matriz, perfil) : false,
    };
  }, [usuario, matriz, entrar, sair, salvarMatriz, atualizarUsuarioLogado]);

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) throw new Error('useSessao deve ser usado dentro de SessaoProvider');
  return contexto;
}
