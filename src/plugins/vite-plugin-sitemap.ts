/**
 * Vite Plugin for Main Sitemap Generation
 *
 * Generates sitemap.xml with all static, indexable routes during build
 */

interface StaticRoute {
  path: string
  priority?: number
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

// Static, indexable routes for the main sitemap
const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/feedback', priority: 0.8, changefreq: 'monthly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/movies', priority: 0.8, changefreq: 'weekly' },
  { path: '/privacy-policy', priority: 0.5, changefreq: 'monthly' },
  { path: '/terms-of-service', priority: 0.5, changefreq: 'monthly' },
  { path: '/cookies-policy', priority: 0.5, changefreq: 'monthly' },
]

export function VitePluginSitemap() {
  return {
    name: 'vite-plugin-sitemap',
    async generateBundle() {
      const baseUrl = process.env.VITE_SITE_URL || 'https://watchnext.app'
      const sitemapXml = generateSitemap(STATIC_ROUTES, baseUrl)

      this.emitFile({
        fileName: 'sitemap.xml',
        type: 'asset',
        source: sitemapXml,
      })

      console.log(`[Sitemap Plugin] Generated sitemap.xml with ${STATIC_ROUTES.length} routes`)
    },
  }
}

function generateSitemap(routes: StaticRoute[], baseUrl: string): string {
  const today = new Date().toISOString().split('T')[0]

  const urlEntries = routes.map(route => {
    const loc = `${baseUrl}${route.path}`
    const priority = route.priority !== undefined ? `    <priority>${route.priority.toFixed(1)}</priority>` : ''
    const changefreq = route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : ''

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
${changefreq}
${priority}
  </url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`
}