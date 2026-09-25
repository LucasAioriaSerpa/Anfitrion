import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiDevPlugin } from './vite-api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiDevPlugin()
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
})
