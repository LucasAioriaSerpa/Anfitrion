import { useState } from "react";
import Auth from "./pages/Auth";
import Rooms from "./pages/Rooms";
import Wip from "./pages/Wip";
import { criarUsuario } from "./models";

function getLandingView(usuario) {
  if (!usuario || !usuario.isFuncionario || !usuario.isFuncionario()) {
    return "wip";
  }

  const cargo = (usuario.cargo || "").toLowerCase();
  return cargo.includes("recep") ? "rooms" : "wip";
}

function App() {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const savedUser = localStorage.getItem("anfitrion_user");
      return savedUser
        ? getLandingView(criarUsuario(JSON.parse(savedUser)))
        : "auth";
    } catch {
      return "auth";
    }
  });

  const handleEnterDashboard = (userRaw) => {
    const usuarioModel = criarUsuario(userRaw);
    setViewMode(getLandingView(usuarioModel));
    try {
      localStorage.setItem("anfitrion_user", JSON.stringify(userRaw));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("anfitrion_user");
    setViewMode("auth");
  };

  // MODO AUTENTICAÇÃO: Preserva 100% o layout e CSS original do Login & Cadastro
  if (viewMode === "auth") {
    return <Auth onEnterDashboard={handleEnterDashboard} />;
  }

  if (viewMode === "rooms") {
    return <Rooms onLogout={handleLogout} />;
  }

  return <Wip />;
}

export default App;
