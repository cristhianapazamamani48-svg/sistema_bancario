import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy para desarrollo local: cuando el frontend pide /api/... 
    // Vite redirige esa petición al backend NestJS en localhost:3000
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // Optimizaciones para producción
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
