import type { BlogPost } from '../types/BlogPost'
import type { BlogProvider } from './BlogProvider'

interface MarkdownModule {
  default: {
    title?: string
    slug?: string
    description?: string
    author?: string
    date?: string
    cover?: string
    category?: string
    tags?: string[]
    updated?: string
    featured?: boolean
  }
  __content: string
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const plainText = content.replace(/<[^>]*>/g, '')
  const wordCount = plainText.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

const postModules = import.meta.glob<MarkdownModule>('./posts/*.md', {
  eager: true
})

export class StaticBlogProvider implements BlogProvider {
  private posts: BlogPost[] = []

  constructor() {
    this.loadPosts()
  }

  private loadPosts(): void {
    this.posts = Object.entries(postModules).map(([path, module]) => {
      const frontmatter = module.default
      const slug = frontmatter.slug || path.replace('./posts/', '').replace('.md', '')

      return {
        title: frontmatter.title || 'Untitled',
        slug,
        description: frontmatter.description || '',
        author: frontmatter.author || 'Watch Next Team',
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        cover: frontmatter.cover || '',
        category: frontmatter.category || 'General',
        tags: frontmatter.tags || [],
        content: module.__content || '',
        readingTime: calculateReadingTime(module.__content || ''),
        updated: frontmatter.updated,
        featured: frontmatter.featured
      }
    })

    this.posts.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  }

  async getPosts(): Promise<BlogPost[]> {
    return this.posts
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return this.posts.find(post => post.slug === slug) || null
  }
}