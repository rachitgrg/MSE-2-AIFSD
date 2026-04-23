import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://lost-found-backend-gr2n.onrender.com',
        changeOrigin: true
      }
    }
  }
})
