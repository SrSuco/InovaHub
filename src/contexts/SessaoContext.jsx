import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MATRIZ_PADRAO, ehSomenteLeitura, temPermissao } from '../data/permissoes.js';
import { gravar, ler, remover } from '../services/armazenamento.js';
import { autenticar } from '../services/usuariosService.js';

const SessaoContext = createContext(null);

export function SessaoProvider({ children }) {
  const [usuario, setUsuario] = useState(() => ler('sessao', null));
  const [matriz, setMatriz] = useState(() => ler('matriz', MATRIZ_PADRAO));

  const entrar = useCallback(async (identificador, senha, manterConectado) => {
    const encontrado = await autenticar(identificador, senha);
    setUsuario(encontrado);
    if (manterConectado) gravar('sessao', encontrado);
    else remover('sessao');
    return encontrado;
  }, []);

  const sair = useCallback(() => {
    setUsuario(null);
    remover('sessao');
  }, []);

  const atualizarUsuarioLogado = useCallback((dados) => {
    setUsuario((atual) => {
      const novo = { ...atual, ...dados };
      if (ler('sessao', null)) gravar('sessao', novo);
      return novo;
    });
  }, []);

  const salvarMatriz = useCallback((nova) => {
    setMatriz(nova);
    gravar('matriz', nova);
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
