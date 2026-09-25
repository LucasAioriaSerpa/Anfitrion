import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RoleViewFactory from './components/views/RoleViewFactory';
import { criarUsuario } from './models';
import { hotelData } from './services/dataManager';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('anfitrion_user');
      return savedUser ? criarUsuario(JSON.parse(savedUser)) : null;
    } catch {
      return null;
    }
  });

  // viewMode: 'auth' | 'dashboard'
  // Inicia em 'auth' para garantir a visualização original do Login & Sign-up
  const [viewMode, setViewMode] = useState('auth');
  const [activeRole, setActiveRole] = useState('auto');

  useEffect(() => {
    hotelData.init();
  }, []);

  const handleEnterDashboard = (userRaw) => {
    const usuarioModel = criarUsuario(userRaw);
    setCurrentUser(usuarioModel);
    setViewMode('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('anfitrion_user');
    setCurrentUser(null);
    setViewMode('auth');
  };

  const handleSwitchProfile = (perfil) => {
    hotelData.init();
    const allUsers = hotelData.getUsuarios();
    const target = allUsers.find(
      (u) => u.email.toLowerCase() === perfil.email.toLowerCase()
    );

    if (target) {
      setCurrentUser(target);
      localStorage.setItem('anfitrion_user', JSON.stringify(target.toDict ? target.toDict() : target));
      setActiveRole('auto');
    }
  };

  // MODO AUTENTICAÇÃO: Preserva 100% o layout e CSS original do Login & Cadastro
  if (viewMode === 'auth') {
    return <Auth onEnterDashboard={handleEnterDashboard} />;
  }

  // MODO PAINEL: Apresenta o painel de variabilidade POO/OO
  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between">
      <Header
        usuario={currentUser}
        onLogout={handleLogout}
        onSwitchProfile={handleSwitchProfile}
        activeViewRole={activeRole}
        onSelectViewRole={setActiveRole}
        onGoToAuth={() => setViewMode('auth')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RoleViewFactory
          usuario={currentUser}
          forcedRole={activeRole === 'auto' ? null : activeRole}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
