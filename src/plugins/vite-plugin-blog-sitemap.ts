/**
 * Vite Plugin for Blog Sitemap Generation
 *
 * Fetches blog posts from Supabase during build and generates blog-sitemap.xml
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

interface BlogPost {
  slug: string
  published_at: string
  updated_at: string | null
}

export function VitePluginBlogSitemap() {
  return {
    name: 'vite-plugin-blog-sitemap',
    async generateBundle() {
      const baseUrl = process.env.VITE_SITE_URL || 'https://watchnext.app'
      const supabaseUrl = process.env.VITE_SUPABASE_URL
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

      // If Supabase is not configured, generate empty sitemap
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[Sitemap Plugin] Supabase not configured, generating empty blog sitemap')
        const emptySitemap = generateEmptySitemap(baseUrl)
        this.emitFile({
          fileName: 'blog-sitemap.xml',
          type: 'asset',
          source: emptySitemap,
        })
        return
      }

      try {
        // Fetch posts from Supabase during build
        const posts = await fetchBlogPosts(supabaseUrl, supabaseAnonKey)
        const sitemapXml = generateSitemap(posts, baseUrl)

        this.emitFile({
          fileName: 'blog-sitemap.xml',
          type: 'asset',
          source: sitemapXml,
        })

        console.log('[Sitemap Plugin] Generated blog-sitemap.xml with', posts.length, 'posts')
      } catch (error) {
        console.error('[Sitemap Plugin] Error generating blog sitemap:', error)
        // Generate empty sitemap on error
        const emptySitemap = generateEmptySitemap(baseUrl)
        this.emitFile({
          fileName: 'blog-sitemap.xml',
          type: 'asset',
          source: emptySitemap,
        })
      }
    },
  }
}

async function fetchBlogPosts(supabaseUrl: string, supabaseAnonKey: string): Promise<BlogPost[]> {
  const url = `${supabaseUrl}/rest/v1/blog_posts`
  const response = await fetch(
    `${url}?select=slug,published_at,updated_at&status=eq.published&published_at=lte.${new Date().toISOString()}&order=published_at.desc`,
    {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'count=exact',
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      console.warn('[Sitemap Plugin] blog_posts table not found, returning empty list')
      return []
    }
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`)
  }

  return response.json()
}

function generateSitemap(posts: BlogPost[], baseUrl: string): string {
  const blogUrls = posts.map(post => {
    const loc = `${baseUrl}/blog/${post.slug}`
    const lastmod = post.updated_at || post.published_at
    const date = new Date(lastmod).toISOString().split('T')[0]

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  })

  // Add the main blog listing page
  blogUrls.unshift(`  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`)

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls.join('\n')}
</urlset>`
}

function generateEmptySitemap(baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
}