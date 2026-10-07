import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getTheme,
  setTheme,
  subscribeToTheme,
} from "../../services/themeService";

export default function ThemeToggle({ compact = false }) {
  const [theme, setCurrentTheme] = useState(getTheme);
  const isDark = theme === "dark";

  useEffect(() => subscribeToTheme(setCurrentTheme), []);

  const handleToggle = () => {
    setCurrentTheme(setTheme(isDark ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}
      aria-label={`Ativar tema ${isDark ? "claro" : "escuro"}`}
      title={`Tema ${isDark ? "escuro" : "claro"}`}
      aria-pressed={isDark}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      {!compact && <span>{isDark ? "Escuro" : "Claro"}</span>}
    </button>
  );
}
