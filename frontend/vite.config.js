import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// vite (dev)
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
      port: parseInt(process.env.FRONTEND_DEV_PORT) || 5173,
      strictPort: true,
      host: true, // 0.0.0.0
      proxy: {
          [process.env.VITE_API_BASE_URL || '/api']: {
              target: process.env.PROXY_TARGET || 'http://backend:5000',
              changeOrigin: true,
              secure: false, // ignore http warnings
          },
          '/media': {
              target: process.env.PROXY_TARGET || 'http://backend:5000',
              changeOrigin: true,
              secure: false,
          },
      }
  },
})