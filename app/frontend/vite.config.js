import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { apiDevPlugin } from "./vite-api-plugin.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: "./build/Anfitrion-App-Build",
    emptyOutDir: true,
  },
});
