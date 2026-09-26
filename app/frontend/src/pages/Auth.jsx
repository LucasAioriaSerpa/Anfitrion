import { useState } from 'react';
import '../style/Auth.css';
import logoAnfitrion from "../assets/logo-Anfitrion.png";
import { authApi } from '../services/apiService';

function AuthFuncionario({ onEnterDashboard }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    role: 'hospede',
    codigoAcesso: '',
    cargo: 'Recepcionista'
  });

  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try {
      const savedUser = localStorage.getItem('anfitrion_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickFill = (email, senha, role = 'hospede', codigoAcesso = '') => {
    setFormData((prev) => ({
      ...prev,
      email,
      senha,
      role,
      codigoAcesso,
      cargo: role === 'hospede' ? 'Hóspede' : (prev.cargo || 'Recepcionista')
    }));
    setErro('');
    setMensagem('');
  };

  const handleLogout = () => {
    localStorage.removeItem('anfitrion_user');
    setUsuarioLogado(null);
    setMensagem('Sessão encerrada com sucesso.');
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!formData.email || !formData.senha) {
      setErro('Preencha e-mail e senha!');
      return;
    }

    const role = (formData.role || 'hospede').toLowerCase();
    if (role !== 'hospede' && !formData.codigoAcesso.trim()) {
      setErro('Informe o código de acesso do funcionário para continuar.');
      return;
    }

    if (isSignUp) {
      if (!formData.nome.trim()) {
        setErro('Por favor, informe seu nome completo.');
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setErro('As senhas não coincidem. Verifique e tente novamente.');
        return;
      }
      if (formData.senha.length < 3) {
        setErro('A senha deve ter pelo menos 3 caracteres.');
        return;
      }
    }

    setCarregando(true);

    try {
      if (isSignUp) {
        // REGRA: Somente hóspedes podem criar conta
        const res = await authApi.register({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          senha: formData.senha,
          telefone: formData.telefone.trim(),
          role: (formData.role || 'hospede').toLowerCase(),
          codigoAcesso: formData.codigoAcesso.trim(),
          cargo: formData.cargo || 'Recepcionista'
        });

        if (res.ok && res.data?.success) {
          setMensagem(res.data.message || 'Conta de hóspede criada com sucesso! Faça login para continuar. ✅');
          setIsSignUp(false);
          setFormData({
            nome: '',
            email: formData.email,
            telefone: '',
            senha: '',
            confirmarSenha: ''
          });
        } else {
          setErro(res.data?.message || 'Falha ao registrar conta de hóspede.');
        }
      } else {
        // LOGIN: Serve tanto para funcionários quanto para hóspedes
        const res = await authApi.login({
          email: formData.email.trim(),
          senha: formData.senha,
          role: (formData.role || 'hospede').toLowerCase(),
          codigoAcesso: formData.codigoAcesso.trim()
        });

        if (res.ok && res.data?.success) {
          const user = res.data?.user;
          const userName = user?.nome || 'Usuário';
          const userRole = user?.role === 'funcionario' 
            ? (user?.cargo ? `Funcionário (${user.cargo})` : 'Funcionário') 
            : 'Hóspede';

          setMensagem(`Bem-vindo(a), ${userName}! Conectado como ${userRole}. ✅`);
          setUsuarioLogado(user);
          localStorage.setItem('anfitrion_user', JSON.stringify(user));
          if (onEnterDashboard) {
            onEnterDashboard(user);
          }
        } else {
          setErro(res.data?.message || 'E-mail ou senha incorretos.');
        }
      }
    } catch (err) {
      setErro(`Erro de conexão com o backend: ${err.message}`);
    } finally {
      setCarregando(false);
      setTimeout(() => {
        setMensagem((prev) => (prev.includes('Bem-vindo') ? prev : ''));
        setErro('');
      }, 6000);
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
          
          {usuarioLogado ? (
            /* Visualização de Sessão Ativa */
            <div className="user-session-card">
              <div className="user-session-avatar">
                {usuarioLogado.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <h2 className="user-session-name">{usuarioLogado.nome}</h2>
              <p className="user-session-email">{usuarioLogado.email}</p>
              
              <div style={{ marginBottom: '1rem' }}>
                <span className={`role-badge ${usuarioLogado.role === 'funcionario' ? 'role-badge-funcionario' : 'role-badge-hospede'}`}>
                  {usuarioLogado.role === 'funcionario' ? '👔 Funcionário' : '🧳 Hóspede'}
                </span>
              </div>

              {mensagem && <div id="auth-success-msg" className="sucesso">{mensagem}</div>}

              <div className="user-details-list">
                <div className="user-details-row">
                  <span className="user-details-label">Perfil de Acesso:</span>
                  <span className="user-details-value">
                    {usuarioLogado.role === 'funcionario' ? 'Equipe Interna' : 'Hóspede'}
                  </span>
                </div>
                {usuarioLogado.cargo && (
                  <div className="user-details-row">
                    <span className="user-details-label">Cargo:</span>
                    <span className="user-details-value">{usuarioLogado.cargo}</span>
                  </div>
                )}
                {usuarioLogado.telefone && (
                  <div className="user-details-row">
                    <span className="user-details-label">Telefone:</span>
                    <span className="user-details-value">{usuarioLogado.telefone}</span>
                  </div>
                )}
                <div className="user-details-row">
                  <span className="user-details-label">Status da Conta:</span>
                  <span className="user-details-value" style={{ color: '#28a745' }}>Ativa</span>
                </div>
              </div>

              {onEnterDashboard && (
                <button
                  type="button"
                  className="btn-entrar"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                  onClick={() => onEnterDashboard(usuarioLogado)}
                >
                  Acessar Painel do Hotel ➔
                </button>
              )}

              <button
                type="button"
                className="btn-sair"
                onClick={handleLogout}
              >
                Desconectar / Trocar de Conta
              </button>
            </div>
          ) : (
            /* Formulário de Login / Cadastro */
            <>
              <div className="login-header">
                <h2>{isSignUp ? 'Criar Conta' : 'Bem-vindo'}</h2>
                <p className="subtitle">
                  {isSignUp
                    ? 'Preencha seus dados para criar uma conta de acesso'
                    : 'Acesse sua conta para continuar (Funcionários & Hóspedes)'}
                </p>
              </div>

              {isSignUp && (
                <div className="auth-notice">
                  <strong>ℹ️ Cadastro por perfil</strong>
                  Hóspedes podem se cadastrar livremente. Funcionários devem informar o código de acesso.
                </div>
              )}

              {mensagem && <div id="auth-success-msg" className="sucesso">{mensagem}</div>}
              {erro && <div id="auth-error-msg" className="erro">{erro}</div>}

              <form id="auth-form" onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="role">Tipo da conta</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="hospede">Hóspede</option>
                    <option value="funcionario">Funcionário</option>
                  </select>
                </div>

                {isSignUp && (
                  <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Ex: Mariana Silva"
                      required
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
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="form-group">
                    <label htmlFor="telefone">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                )}

                {(formData.role || 'hospede') !== 'hospede' && (
                  <div className="form-group">
                    <label htmlFor="codigoAcesso">Código de acesso do funcionário</label>
                    <input
                      type="text"
                      id="codigoAcesso"
                      name="codigoAcesso"
                      value={formData.codigoAcesso}
                      onChange={handleChange}
                      placeholder="Digite o código do funcionário"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="senha">Senha</label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="form-group">
                    <label htmlFor="confirmarSenha">Confirmar Senha</label>
                    <input
                      type="password"
                      id="confirmarSenha"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      placeholder="Repita a senha digitada"
                      required
                    />
                  </div>
                )}

                <button
                  id="auth-submit-btn"
                  type="submit"
                  className="btn-entrar"
                  disabled={carregando}
                >
                  {carregando
                    ? 'Processando...'
                    : (isSignUp ? 'Criar Conta' : 'Entrar')}
                </button>
              </form>

              {/* Botão de Alternância entre Login e Cadastro */}
              <div className="toggle-form">
                <button
                  id="auth-toggle-mode-btn"
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErro('');
                    setMensagem('');
                  }}
                >
                  {isSignUp
                    ? 'Já tem conta? Fazer login'
                    : 'Não tem conta? Cadastre-se'}
                </button>
              </div>

              {/* Acesso rápido com contas de demonstração (Hóspede e todos os cargos) */}
              {!isSignUp && (
                <div className="quick-test-box">
                  <div className="quick-test-title">Contas seed para teste rápido:</div>
                  <div className="quick-test-chips">
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('mariana@gmail.com', '123', 'hospede')}
                      title="Conta de hóspede existente"
                    >
                      🧳 Hóspede (Mariana)
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('admin@anfitrion.com', 'admin', 'funcionario', 'ADMIN2024')}
                      title="Administrador Geral"
                    >
                      🛡️ Administrador
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('gerente@anfitrion.com', '123', 'funcionario', 'GERENTE2024')}
                      title="Gerente Geral"
                    >
                      👔 Gerente Geral
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('subgerente@anfitrion.com', '123', 'funcionario', 'SUBGERENTE2024')}
                      title="Subgerente Operacional"
                    >
                      📋 Subgerente
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('recepcao@anfitrion.com', '123', 'funcionario', 'RECEPCAO2024')}
                      title="Recepcionista"
                    >
                      🛎️ Recepcionista
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('governanta@anfitrion.com', '123', 'funcionario', 'GOVERNANTA2024')}
                      title="Governanta Chefe"
                    >
                      🗝️ Governanta
                    </button>
                    <button
                      type="button"
                      className="quick-test-chip"
                      onClick={() => handleQuickFill('camareira@anfitrion.com', '123', 'funcionario', 'CAMAREIRA2024')}
                      title="Camareira Sênior"
                    >
                      🧹 Camareira
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default AuthFuncionario;
