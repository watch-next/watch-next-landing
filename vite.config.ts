import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

function googleAnalyticsPlugin(): Plugin {
  const gaId = process.env.VITE_GOOGLE_ANALYTICS_ID

  return {
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
}

export default defineConfig({
  plugins: [vue(), googleAnalyticsPlugin()],
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
})