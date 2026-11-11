import { useSessao } from '../../contexts/SessaoContext.jsx';
import PaginaErro from './PaginaErro.jsx';

export default function AcessoNegado() {
  const { perfil, sair } = useSessao();
  return (
    <div onClickCapture={(e) => e.target.closest('a[href="/login"]') && sair()}>
      <PaginaErro
        codigo="403"
        icone="shield"
        titulo="Acesso não autorizado"
        texto={
          perfil
            ? `Seu perfil (${perfil}) não tem permissão para abrir esta página. Se precisar do acesso, fale com o administrador ou entre com outra conta.`
            : 'Você precisa entrar com uma conta que tenha permissão para abrir esta página.'
        }
        acaoPrincipal={{ rota: '/login', rotulo: 'Ir para o login' }}
      />
    </div>
  );
}
