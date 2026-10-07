import configService from "./ConfigService";

const THEME_KEY = "anfitrion_theme";
const THEME_EVENT = "anfitrion:theme-change";
const DEFAULT_THEME = "dark";

export function getTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
}

export function applyTheme(theme = DEFAULT_THEME) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  configService.setConfig({ theme: nextTheme });
  return nextTheme;
}

export function initializeTheme() {
  return applyTheme(getTheme());
}

export function setTheme(theme) {
  const nextTheme = applyTheme(theme);
  localStorage.setItem(THEME_KEY, nextTheme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }));
  return nextTheme;
}

export function subscribeToTheme(callback) {
  const handleThemeChange = (event) => callback(event.detail || getTheme());
  window.addEventListener(THEME_EVENT, handleThemeChange);
  return () => window.removeEventListener(THEME_EVENT, handleThemeChange);
}
