import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiUrl = new URL(env.VITE_API_URL || 'http://127.0.0.1:3000')
  const apiLocal = ['localhost', '127.0.0.1', '[::1]'].includes(apiUrl.hostname)
  // El backend local escucha IPv4. Vite reenvía la API sin cambiar su CORS.
  if (apiLocal) apiUrl.hostname = '127.0.0.1'
  return {
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: apiLocal ? {
      '/api': { target: apiUrl.origin, changeOrigin: true },
    } : undefined,
  },
  }
})
