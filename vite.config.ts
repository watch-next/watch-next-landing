import { defineConfig, loadEnv, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePluginRSS } from './src/plugins/vite-plugin-rss'
import { VitePluginBlogSitemap } from './src/plugins/vite-plugin-blog-sitemap'
import { proxyToTmdb } from './src/lib/tmdb/proxy/proxyHandler'
import * as http from 'node:http'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || 'development', process.cwd(), '')
  const gaId = env.VITE_GOOGLE_ANALYTICS_ID
  const tmdbApiKey = env.TMDB_API_KEY
  const tmdbApiBase = env.TMDB_API_BASE || 'https://api.themoviedb.org/3'
  const tmdbLanguage = env.VITE_TMDB_LANGUAGE || 'en-US'
  const tmdbRegion = env.VITE_TMDB_REGION || 'US'

  // TMDB Proxy for local development
  const tmdbProxyPlugin: Plugin = {
    name: 'tmdb-proxy',
    configureServer(server) {
      console.log('[TMDB Proxy] Registering middleware for /api/tmdb')
      server.middlewares.use('/api/tmdb', async (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => {
        console.log(`[TMDB Proxy] Request: ${req.method} ${req.url}`)
        async function handleProxy() {
          try {
            const url = new URL(req.url || '', 'http://localhost')
            // Middleware strips mount path, so url.pathname is already the TMDB path
            // e.g., /movie/popular or /movie/550
            const path = url.pathname.replace(/^\//, '') // remove leading slash

            if (!path) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Path required', message: 'Example: /api/tmdb/movie/popular' }))
              return
            }

            console.log(`[TMDB Proxy] Normalized path: ${path}`)

            const result = await proxyToTmdb(path, url.searchParams, {
              apiKey: tmdbApiKey || '',
              apiBase: tmdbApiBase,
              defaultLanguage: tmdbLanguage,
              defaultRegion: tmdbRegion,
            })

            console.log(`[TMDB Proxy] Result: ${result.statusCode}`)

            res.statusCode = result.statusCode
            for (const [key, value] of Object.entries(result.headers)) {
              res.setHeader(key, value)
            }

            if (typeof result.body === 'string') {
              res.end(result.body)
            } else {
              res.end(JSON.stringify(result.body))
            }
          } catch (error) {
            console.error('[TMDB Proxy] Error:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              error: 'Proxy error',
              message: error instanceof Error ? error.message : 'Unknown error',
            }))
          }
        }

        handleProxy().catch(next)
      })
    }
  }

  const googleAnalyticsPlugin = {
    name: 'google-analytics',
    transformIndexHtml(html: string) {
      if (!gaId) {
        return html.replace('%VITE_GOOGLE_ANALYTICS%', '')
      }

      const gtagScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  function gtag(){dataLayer.push(arguments);}
  window.dataLayer = window.dataLayer || [];
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>`

      return html.replace('%VITE_GOOGLE_ANALYTICS%', gtagScript)
    }
  }

  return {
    plugins: [vue(), googleAnalyticsPlugin, VitePluginRSS(), VitePluginBlogSitemap(), tmdbProxyPlugin],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    assetsInclude: ['**/*.md'],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/style/variables" as *;\n@use "@/style/components/inputs" as *;\n@use "@/style/components/badges" as *;\n`
        }
      }
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false
    }
  }
})