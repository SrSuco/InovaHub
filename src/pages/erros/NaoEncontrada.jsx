import PaginaErro from './PaginaErro.jsx';

export default function NaoEncontrada() {
  return (
    <PaginaErro
      codigo="404"
      icone="compass"
      titulo="Página não encontrada"
      texto="O endereço acessado não existe ou foi movido. Confira o link ou volte para o início."
      acaoPrincipal={{ rota: '/', rotulo: 'Ir para o início' }}
    />
  );
}
