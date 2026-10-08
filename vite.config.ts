import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// sibling of kuang-front: ../kuang_static_resources
const staticResourcesRoot = path.resolve(__dirname, '../kuang_static_resources')

function serveKuangStaticResources(): Plugin {
  return {
    name: 'serve-kuang-static-resources',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (!url.startsWith('/kuang_static_resources/')) {
          next()
          return
        }

        const rel = decodeURIComponent(url.replace(/^\/kuang_static_resources\//, ''))
        const filePath = path.normalize(path.join(staticResourcesRoot, rel))
        if (!filePath.startsWith(staticResourcesRoot + path.sep) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.statusCode = 404
          res.end('Not Found')
          return
        }

        const ext = path.extname(filePath).toLowerCase()
        const types: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.bmp': 'image/bmp',
        }
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'public, max-age=3600')
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), serveKuangStaticResources()],
  server: {
    fs: {
      allow: [__dirname, staticResourcesRoot],
    },
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
    },
  },
})
