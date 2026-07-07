import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { BlogPost } from '../types/BlogPost'
import type { BlogProvider } from '../provider/BlogProvider'
import { calculateReadingTime } from '../utils/readingTime'

interface SupabaseBlogPost {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  cover: string | null
  author: string
  category: string
  tags: string[] | null
  featured: boolean
  status: string
  published_at: string | null
  updated_at: string | null
  created_at: string | null
  seo_title: string | null
  seo_description: string | null
  og_image: string | null
  reading_time: number | null
}

export class SupabaseBlogProvider implements BlogProvider {
  private cache: BlogPost[] | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_TTL = 60000 // 1 minute cache

  private mapToBlogPost(post: SupabaseBlogPost): BlogPost {
    return {
      slug: post.slug,
      title: post.title,
      description: post.description || '',
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags || [],
      cover: post.cover || '',
      date: post.published_at || post.created_at || new Date().toISOString(),
      updated: post.updated_at || undefined,
      featured: post.featured,
      readingTime: post.reading_time || calculateReadingTime(post.content),
      seoTitle: post.seo_title || undefined,
      seoDescription: post.seo_description || undefined,
      ogImage: post.og_image || undefined,
    }
  }

  async getPosts(): Promise<BlogPost[]> {
    // Check cache first
    const now = Date.now()
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cache
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty blog posts list')
      return []
    }

    try {
      // Query published posts (RLS policy handles status filtering)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }

      const posts = (data as SupabaseBlogPost[]).map(this.mapToBlogPost)
      this.cache = posts
      this.cacheTimestamp = now

      return posts
    } catch (error) {
      console.error('Unexpected error fetching blog posts:', error)
      return []
    }
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot fetch post')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // PostgREST 116: No rows found
          return null
        }
        console.error('Error fetching blog post:', error)
        return null
      }

      return this.mapToBlogPost(data as SupabaseBlogPost)
    } catch (error) {
      console.error('Unexpected error fetching blog post:', error)
      return null
    }
  }

  /**
   * Get all categories from published posts
   */
  async getCategories(): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      const categories = new Set((data as SupabaseBlogPost[]).map(p => p.category))
      return Array.from(categories).sort()
    } catch (error) {
      console.error('Unexpected error fetching categories:', error)
      return []
    }
  }

  /**
   * Get all tags from published posts
   */
  async getTags(): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())

      if (error) {
        console.error('Error fetching tags:', error)
        return []
      }

      const tagSet = new Set<string>()
      ;(data as SupabaseBlogPost[]).forEach(post => {
        post.tags?.forEach(tag => tagSet.add(tag))
      })

      return Array.from(tagSet).sort()
    } catch (error) {
      console.error('Unexpected error fetching tags:', error)
      return []
    }
  }

  /**
   * Clear the cache (useful after admin updates)
   */
  clearCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
  }
}