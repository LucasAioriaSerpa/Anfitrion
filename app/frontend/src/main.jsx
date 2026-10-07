import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/main.css";
import App from "./App.jsx";
import { initializeTheme } from "./services/themeService";

initializeTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
