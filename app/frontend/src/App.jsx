import { useEffect, useSyncExternalStore, useState } from "react";
import Auth from "./pages/Auth";
import { criarUsuario } from "./models";
import { logout } from "./services/apiService";
import RoleViewFactory from "./components/views/RoleViewFactory";
import Header from "./components/layout/Header";
import { dataManager } from "./services/dataManager";

function App() {
  const [userRaw, setUserRaw] = useState(() => {
    try {
      const savedUser = localStorage.getItem("anfitrion_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [activeViewRole, setActiveViewRole] = useState("auto");

  useSyncExternalStore(
    dataManager.subscribe.bind(dataManager),
    () => dataManager.version,
    () => 0,
  );

  useEffect(() => {
    dataManager.init();
    const handleGlobalLogout = () => setUserRaw(null);
    window.addEventListener("anfitrion:logout", handleGlobalLogout);
    return () =>
      window.removeEventListener("anfitrion:logout", handleGlobalLogout);
  }, []);

  const handleEnterDashboard = (userRaw) => {
    setUserRaw(userRaw);
    try {
      localStorage.setItem("anfitrion_user", JSON.stringify(userRaw));
    } catch {
      // ignore
    }
  };

  if (!userRaw) {
    return <Auth onEnterDashboard={handleEnterDashboard} />;
  }

  const usuario = criarUsuario(userRaw);
  if (!usuario) return <Auth onEnterDashboard={handleEnterDashboard} />;

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header
        usuario={usuario}
        activeViewRole={activeViewRole}
        onSelectViewRole={setActiveViewRole}
        canSelectViewRole={usuario.isAdmin?.() === true}
        onGoToAuth={logout}
        onLogout={logout}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RoleViewFactory
          usuario={usuario}
          dataManager={dataManager}
          overrideRole={activeViewRole}
        />
      </main>
    </div>
  );
}

export default App;
