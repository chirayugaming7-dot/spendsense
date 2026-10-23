import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const groqProxy = {
  '/api/groq': {
    target: 'https://api.groq.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/groq/, '')
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: groqProxy
  },
  preview: {
    proxy: groqProxy
  }
})
