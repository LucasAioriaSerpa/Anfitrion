import { useState } from 'react';
import '../style/Login.css';
import logoAnfitrion from "../assets/logo-Anfitrion.png";
function LoginFuncionario() {
  const [formData, setFormData] = useState({
    codigoAcesso: '',
    email: '',
    senha: ''
  });

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setErro('Preencha e-mail e senha!');
      return;
    }

    if (isSignUp && !formData.codigoAcesso) {
      setErro('Código de acesso é obrigatório para se registrar!');
      return;
    }

    console.log('Dados de login:', formData);
    setMensagem(isSignUp ? 'Conta criada com sucesso! ✅' : 'Login realizado! ✅');
    setErro('');

    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="login-container">
      {/* Lado Esquerdo - Logo e Tagline */}
      <div className="login-left">
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
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>{isSignUp ? 'Criar Conta' : 'Bem-vindo'}</h2>
            {!isSignUp && <p className="subtitle">Acesse sua conta para continuar</p>}
          </div>

          {mensagem && <div className="sucesso">{mensagem}</div>}
          {erro && <div className="erro">{erro}</div>}

          <form onSubmit={handleSubmit} className="login-form">
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

            <button type="submit" className="btn-entrar">
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="toggle-form">
            <button 
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

export default LoginFuncionario;
