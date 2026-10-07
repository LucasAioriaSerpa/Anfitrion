import logoAnfitrion from "../../assets/logo-Anfitrion.png";
import { LogOut, LayoutDashboard } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Header Unificado com Suporte a Variabilidade de Interfaces
 */
export default function Header({
  usuario,
  onLogout,
  activeViewRole,
  onSelectViewRole,
  onGoToAuth,
  canSelectViewRole = false,
}) {
  return (
    <header className="bg-[#3c362a] text-[#b8c4bb] sticky top-0 z-40 border-b border-[#b8c4bb]/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo e Nome do Hotel */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center p-1 border border-white/20">
            <img
              src={logoAnfitrion}
              alt="Anfitrião"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-white tracking-tight leading-none block">
              Anfitrião
            </span>
            <span className="text-[10px] text-[#b8c4bb]/70 tracking-widest uppercase">
              Grand Hotel & Resort
            </span>
          </div>
        </div>

        {/* Seletor de visao para perfis autorizados */}
        {canSelectViewRole && (
          <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#b8c4bb]/80 shrink-0" />
            <span className="text-[11px] font-medium text-stone-300">
              Visão:
            </span>
            <select
              value={activeViewRole}
              onChange={(e) => onSelectViewRole(e.target.value)}
              className="bg-stone-800 text-stone-100 text-xs px-2.5 py-1 rounded border border-stone-600 focus:outline-none focus:border-[#b8c4bb] cursor-pointer"
              title="Alterne a visão para ver o reuso de componentes e adaptação por perfil"
            >
              <option value="auto">Automático (Baseado no Perfil)</option>
              <option value="hospede">
                Visão Hóspede (Catálogo & Reservas)
              </option>
              <option value="housekeeping">
                Visão Higienização (Camareira/Governanta)
              </option>
              <option value="reception">
                Visão Recepção (Check-in & Balcão)
              </option>
              <option value="manager">
                Visão Gerência (Indicadores & Tarifas)
              </option>
              <option value="admin">
                Visão Administrador (Equipe & Hotel)
              </option>
            </select>
          </div>
        )}

        {/* Perfil Conectado & Ações */}
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          {usuario ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {usuario.nome}
                </div>
                <div className="text-[11px] text-[#b8c4bb]/80">
                  {usuario.isFuncionario()
                    ? usuario.cargo || "Funcionário"
                    : "Hóspede"}
                </div>
              </div>

              <div
                className="w-8 h-8 rounded-full bg-[#663f46] text-white flex items-center justify-center font-bold text-xs border border-white/20 shadow-xs"
                title={`${usuario.nome} (${usuario.email})`}
              >
                {usuario.getIniciais ? usuario.getIniciais() : "U"}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Desconectar"
                aria-label="Desconectar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onGoToAuth}
              className="text-xs px-3 py-1 bg-[#663f46] text-white rounded hover:bg-[#7e4f57]"
            >
              Fazer Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
