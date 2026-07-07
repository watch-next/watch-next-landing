/**
 * Vite Plugin for RSS Feed Generation
 *
 * Fetches blog posts from Supabase during build and generates RSS.xml
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

interface BlogPost {
  title: string
  slug: string
  description: string
  author: string
  published_at: string
}

export function VitePluginRSS() {
  return {
    name: 'vite-plugin-rss',
    async generateBundle() {
      const baseUrl = process.env.VITE_SITE_URL || 'https://watchnext.app'
      const supabaseUrl = process.env.VITE_SUPABASE_URL
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

      // If Supabase is not configured, generate empty RSS feed
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[RSS Plugin] Supabase not configured, generating empty RSS feed')
        const emptyRss = generateEmptyRSS(baseUrl)
        this.emitFile({
          fileName: 'rss.xml',
          type: 'asset',
          source: emptyRss,
        })
        return
      }

      try {
        // Fetch posts from Supabase during build
        const posts = await fetchBlogPosts(supabaseUrl, supabaseAnonKey)
        const rssXml = generateRSS(posts, baseUrl)

        this.emitFile({
          fileName: 'rss.xml',
          type: 'asset',
          source: rssXml,
        })

        console.log('[RSS Plugin] Generated rss.xml with', posts.length, 'posts')
      } catch (error) {
        console.error('[RSS Plugin] Error generating RSS feed:', error)
        // Generate empty RSS feed on error
        const emptyRss = generateEmptyRSS(baseUrl)
        this.emitFile({
          fileName: 'rss.xml',
          type: 'asset',
          source: emptyRss,
        })
      }
    },
  }
}

async function fetchBlogPosts(supabaseUrl: string, supabaseAnonKey: string): Promise<BlogPost[]> {
  const url = `${supabaseUrl}/rest/v1/blog_posts`
  const response = await fetch(
    `${url}?select=slug,title,description,author,published_at&status=eq.published&published_at=lte.${new Date().toISOString()}&order=published_at.desc`,
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
      console.warn('[RSS Plugin] blog_posts table not found, returning empty list')
      return []
    }
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`)
  }

  return response.json()
}

function generateRSS(posts: BlogPost[], baseUrl: string): string {
  const siteTitle = 'Watch Next Blog'
  const siteDescription = 'News, guides, and insights about streaming and Watch Next'
  const blogUrl = `${baseUrl}/blog`

  const items = posts.map(post => {
    const postUrl = `${blogUrl}/${post.slug}`
    const pubDate = new Date(post.published_at).toUTCString()

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.description)}</description>
      <author>${escapeXml(post.author)}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`
}

function generateEmptyRSS(baseUrl: string): string {
  const blogUrl = `${baseUrl}/blog`
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Watch Next Blog</title>
    <link>${blogUrl}</link>
    <description>News, guides, and insights about streaming and Watch Next</description>
    <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;')
}