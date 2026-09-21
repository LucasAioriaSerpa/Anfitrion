import { useState } from 'react';
import '../style/Auth.css';
import logoAnfitrion from "../assets/logo-Anfitrion.png";
import { authApi } from '../services/apiService';

function AuthFuncionario() {
  const [formData, setFormData] = useState({
    codigoAcesso: '',
    email: '',
    senha: ''
  });

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setErro('Preencha e-mail e senha!');
      return;
    }

    if (isSignUp && !formData.codigoAcesso) {
      setErro('Código de acesso é obrigatório para se registrar como funcionário!');
      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      if (isSignUp) {
        const res = await authApi.register({
          email: formData.email,
          senha: formData.senha,
          codigoAcesso: formData.codigoAcesso,
          role: 'funcionario'
        });

        if (res.ok && res.data?.success) {
          setMensagem(res.data.message || 'Conta criada com sucesso! ✅');
          setIsSignUp(false);
          setFormData({ codigoAcesso: '', email: formData.email, senha: '' });
        } else {
          setErro(res.data?.message || 'Falha ao registrar conta no servidor.');
        }
      } else {
        const res = await authApi.login({
          email: formData.email,
          senha: formData.senha
        });

        if (res.ok && res.data?.success) {
          const userName = res.data?.user?.nome || 'Usuário';
          const userRole = res.data?.user?.cargo || res.data?.user?.role || 'Funcionário';
          setMensagem(`Bem-vindo, ${userName} (${userRole})! ✅`);
          localStorage.setItem('anfitrion_user', JSON.stringify(res.data.user));
        } else {
          setErro(res.data?.message || 'E-mail ou senha incorretos.');
        }
      }
    } catch (err) {
      setErro(`Erro de conexão com o backend: ${err.message}`);
    } finally {
      setCarregando(false);
      setTimeout(() => {
        setMensagem('');
        setErro('');
      }, 5000);
    }
  };

  return (
    <div id="auth-funcionario-container" className="login-container">
      {/* Lado Esquerdo - Logo e Tagline */}
      <div id="auth-left-section" className="login-left">
        <div className="logo-section">
          <div className="logo-circle">
            <img src={logoAnfitrion} alt="Logo Anfitrião" className="logo-img" />
          </div>
          <div className="tagline">
            <p>"A hospitalidade é a arte de fazer o hóspede sentir-se em casa."</p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div id="auth-right-section" className="login-right">
        <div id="auth-card" className="login-card">
          <div className="login-header">
            <h2>{isSignUp ? 'Criar Conta' : 'Bem-vindo'}</h2>
            {!isSignUp && <p className="subtitle">Acesse sua conta para continuar</p>}
          </div>

          {mensagem && <div id="auth-success-msg" className="sucesso">{mensagem}</div>}
          {erro && <div id="auth-error-msg" className="erro">{erro}</div>}

          <form id="auth-form" onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="codigoAcesso">Código de Acesso</label>
                <input
                  type="text"
                  id="codigoAcesso"
                  name="codigoAcesso"
                  value={formData.codigoAcesso}
                  onChange={handleChange}
                  placeholder="..."
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="..."
                required
              />
            </div>

            <button id="auth-submit-btn" type="submit" className="btn-entrar" disabled={carregando}>
              {carregando ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>

          <div className="toggle-form">
            <button 
              id="auth-toggle-mode-btn"
              type="button" 
              className="link-btn"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Crie uma'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthFuncionario;
