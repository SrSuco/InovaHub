import { useEffect, useState } from 'react';
import { responsaveisDisponiveis } from '../services/usuariosService.js';

/** Equipe ativa do parque, usada no campo e no filtro "Responsável no parque". */
export function useResponsaveis() {
  const [responsaveis, setResponsaveis] = useState([]);
  useEffect(() => {
    let ativo = true;
    responsaveisDisponiveis()
      .then((lista) => ativo && setResponsaveis(lista))
      .catch(() => ativo && setResponsaveis([]));
    return () => {
      ativo = false;
    };
  }, []);
  return responsaveis;
}
