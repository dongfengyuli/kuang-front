import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/admin': {
        target: 'http://localhost:8803',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin/, ''),
      },
      '/api/content_ecology': {
        target: 'http://localhost:8802',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/content_ecology/, ''),
      },
      '/api/user': {
        target: 'http://localhost:8801',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/user/, ''),
      },
      '/kuang_static_resources': {
        target: 'http://localhost:8802',
        changeOrigin: true,
      },
    },
  },
})
