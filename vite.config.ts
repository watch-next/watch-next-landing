import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { VitePluginRSS } from './src/plugins/vite-plugin-rss'
import { VitePluginBlogSitemap } from './src/plugins/vite-plugin-blog-sitemap'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || 'development', process.cwd(), '')
  const gaId = env.VITE_GOOGLE_ANALYTICS_ID

  const googleAnalyticsPlugin = {
    name: 'google-analytics',
    transformIndexHtml(html: string) {
      if (!gaId) {
        // Remove placeholder if no GA ID configured
        return html.replace('%VITE_GOOGLE_ANALYTICS%', '')
      }

      const gtagScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>`

      return html.replace('%VITE_GOOGLE_ANALYTICS%', gtagScript)
    }
  }

  return {
    plugins: [vue(), googleAnalyticsPlugin, VitePluginRSS(), VitePluginBlogSitemap()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/style/variables" as *;\n`
        }
      }
    }
  }
})