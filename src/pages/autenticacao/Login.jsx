import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icone from '../../components/Icone.jsx';
import Logo from '../../components/Logo.jsx';
import { useSessao } from '../../contexts/SessaoContext.jsx';
import logoInovaparq from '../../assets/inovaparq-logo.png';
import logoUniville from '../../assets/logo-univille.png';

export default function Login() {
  const { usuario, entrar } = useSessao();
  const navegar = useNavigate();
  const local = useLocation();
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [manter, setManter] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [faltando, setFaltando] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={local.state?.de ?? '/'} replace />;

  async function enviar(evento) {
    evento.preventDefault();
    const vazios = { identificador: !identificador.trim(), senha: !senha };
    setFaltando(vazios);
    setErro('');
    if (vazios.identificador || vazios.senha) return;
    setEnviando(true);
    try {
      await entrar(identificador, senha, manter);
      navegar(local.state?.de ?? '/', { replace: true });
    } catch (e) {
      setErro(e.message);
      setSenha('');
    } finally {
      setEnviando(false);
    }
  }

  const comErro = Boolean(erro);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      <section className="painel-marca hidden lg:flex flex-col justify-between p-12">
        <Logo tamanho="w-12 h-12" texto="text-2xl" inverso />
        <div className="max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Todas as empresas do parque, num só lugar.</h2>
          <p className="mt-4 text-base opacity-90">
            Acompanhe incubadas, residentes e parceiros, registre cada contato e veja os indicadores do InovaParq.
          </p>
        </div>
        <div className="text-sm opacity-80">Parque de Inovação, Ciência e Tecnologia da UNIVILLE</div>
      </section>

      <section className="flex flex-col justify-center gutter py-10">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8 lg:hidden">
            <Logo tamanho="w-10 h-10" texto="text-xl" />
          </div>
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="text-sm opacity-70 mt-2 mb-6">Use seu usuário ou e-mail institucional.</p>

          {comErro && (
            <div role="alert" className="alert alert-error mb-5 text-sm">
              <Icone nome="alert" />
              <div>
                <b>{erro}</b>
                <div>Confira os dados e tente de novo. Após 5 tentativas o acesso é bloqueado por 15 minutos.</div>
              </div>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
            <div className="form-control w-full">
              <label className="label" htmlFor="login-usuario">
                <span className="label-text font-medium">Usuário ou e-mail</span>
              </label>
              <label className={`input input-bordered flex items-center gap-2 ${comErro || faltando.identificador ? 'input-error' : ''}`}>
                <Icone nome="mail" className="w-4 h-4 opacity-60" />
                <input
                  id="login-usuario"
                  type="text"
                  className="grow"
                  placeholder="nome.sobrenome@univille.br"
                  autoComplete="username"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  aria-invalid={comErro || faltando.identificador}
                  aria-describedby={faltando.identificador ? 'erro-usuario' : undefined}
                />
              </label>
              {faltando.identificador && (
                <span id="erro-usuario" className="label-text-alt text-error mt-1">Informe seu usuário ou e-mail.</span>
              )}
            </div>

            <div className="form-control w-full">
              <div className="label">
                <label htmlFor="login-senha" className="label-text font-medium">Senha</label>
                <a href="#esqueci" className="label-text-alt link link-primary">Esqueci minha senha</a>
              </div>
              <label className={`input input-bordered flex items-center gap-2 ${comErro || faltando.senha ? 'input-error' : ''}`}>
                <Icone nome="lock" className="w-4 h-4 opacity-60" />
                <input
                  id="login-senha"
                  type={verSenha ? 'text' : 'password'}
                  className="grow"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  aria-invalid={comErro || faltando.senha}
                  aria-describedby={faltando.senha ? 'erro-senha' : undefined}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setVerSenha((v) => !v)}
                >
                  <Icone nome={verSenha ? 'eyeoff' : 'eye'} className="w-4 h-4" />
                </button>
              </label>
              {faltando.senha && <span id="erro-senha" className="label-text-alt text-error mt-1">Informe sua senha.</span>}
            </div>

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={manter}
                onChange={(e) => setManter(e.target.checked)}
              />
              <span className="label-text">Manter conectado neste computador</span>
            </label>

            <button className="btn btn-primary w-full mt-1" type="submit" disabled={enviando}>
              {enviando && <span className="loading loading-spinner loading-sm" />}
              Acessar
            </button>
          </form>

          <div className="divider text-xs opacity-60 my-8">apoio</div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="bg-white rounded-lg p-1 inline-flex">
                <img src={logoInovaparq} alt="Logo InovaParq" className="h-8 w-8 rounded" />
              </span>
              <span className="bg-white rounded-lg p-1 inline-flex">
                <img src={logoUniville} alt="Logo UNIVILLE" className="h-8" />
              </span>
            </span>
            <span className="text-xs opacity-60 text-right">Problemas de acesso? Fale com a equipe do InovaParq.</span>
          </div>
          <p className="text-xs opacity-60 mt-6">
            Ambiente de demonstração: use <b>admin</b>, <b>gerencia</b>, <b>analista</b> ou <b>consulta</b> com a senha <b>inovahub</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
