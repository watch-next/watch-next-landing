/**
 * Blog CRUD Service
 *
 * Handles all blog post operations for the admin panel
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { calculateReadingTime } from '@/blog/utils/readingTime'

export interface BlogPostInput {
  slug: string
  title: string
  description: string
  content: string
  cover?: string
  author: string
  category: string
  tags: string[]
  featured?: boolean
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
  canonicalUrl?: string
  excerpt?: string
}

export interface BlogPostValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface BlogPostRecord extends BlogPostInput {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  createdBy?: string
  updatedBy?: string
  readingTime: number
}

/**
 * Validate blog post fields
 */
export function validateBlogPost(input: BlogPostInput): BlogPostValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!input.title?.trim()) {
    errors.push('Title is required')
  }

  if (!input.slug?.trim()) {
    errors.push('Slug is required')
  }

  if (!input.description?.trim()) {
    errors.push('Description is required')
  }

  if (!input.content?.trim()) {
    errors.push('Content is required')
  }

  if (!input.category?.trim()) {
    errors.push('Category is required')
  }

  // Slug format validation
  if (input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens')
  }

  // SEO warnings (don't block saving)
  if (!input.seoTitle?.trim()) {
    warnings.push('SEO title is empty - will use post title')
  }

  if (!input.seoDescription?.trim()) {
    warnings.push('SEO description is empty - will use post description')
  }

  // Published posts should have publishedAt
  if (input.status === 'published' && !input.publishedAt) {
    errors.push('Published posts must have a publication date')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Normalize slug: lowercase, hyphens, remove invalid characters
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate slug from title
 */
export function generateSlugFromTitle(title: string): string {
  return normalizeSlug(title)
}

/**
 * Check if slug is unique (not already in use)
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: string
): Promise<{ isUnique: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { isUnique: true, error: null }
  }

  try {
    let query = supabase
      .from('blog_posts')
      .select('id', { count: 'exact' })
      .eq('slug', slug)
      .is('deleted_at', null)

    // Exclude current post when editing
    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { count, error } = await query

    if (error) {
      return { isUnique: false, error: error.message }
    }

    return { isUnique: count === 0, error: null }
  } catch (error: any) {
    return { isUnique: false, error: error.message || 'Failed to check slug uniqueness' }
  }
}

/**
 * Create a new blog post
 */
export async function createBlogPost(
  input: BlogPostInput,
  userId?: string
): Promise<{ data: BlogPostRecord | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  // Validate input
  const validation = validateBlogPost(input)
  if (!validation.isValid) {
    return { data: null, error: validation.errors.join(', ') }
  }

  // Check slug uniqueness
  const { isUnique, error: slugError } = await isSlugUnique(input.slug)
  if (!isUnique) {
    return { data: null, error: slugError || 'Slug already exists' }
  }

  try {
    const readingTime = calculateReadingTime(input.content)

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...input,
        published_at: input.publishedAt || null,
        reading_time: readingTime,
        created_by: userId || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'A post with this slug already exists' }
      }
      return { data: null, error: error.message }
    }

    return { data: mapToRecord(data), error: null }
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to create post' }
  }
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
  userId?: string
): Promise<{ data: BlogPostRecord | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  // Validate if we have enough data to validate
  if (input.title || input.slug || input.description || input.content || input.category) {
    const fullInput = { ...getBlogPostById(id).then(r => r.data || {}), ...input } as BlogPostInput
    const validation = validateBlogPost(fullInput)
    if (!validation.isValid) {
      return { data: null, error: validation.errors.join(', ') }
    }
  }

  // Check slug uniqueness if slug is being changed
  if (input.slug) {
    const { isUnique, error: slugError } = await isSlugUnique(input.slug, id)
    if (!isUnique) {
      return { data: null, error: slugError || 'Slug already exists' }
    }
  }

  try {
    const updateData: Record<string, any> = { ...input }

    if (input.publishedAt !== undefined) {
      updateData.published_at = input.publishedAt
    }

    if (userId) {
      updateData.updated_by = userId
    }

    // If content changed, recalculate reading time
    if (input.content) {
      updateData.reading_time = calculateReadingTime(input.content)
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { data: null, error: 'A post with this slug already exists' }
      }
      return { data: null, error: error.message }
    }

    return { data: mapToRecord(data), error: null }
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to update post' }
  }
}

/**
 * Soft delete a blog post
 */
export async function deleteBlogPost(
  id: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete post' }
  }
}

/**
 * Permanently delete a blog post (for admin only)
 */
export async function permanentlyDeleteBlogPost(
  id: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Failed to permanently delete post' }
  }
}

/**
 * Restore a soft-deleted blog post
 */
export async function restoreBlogPost(
  id: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Failed to restore post' }
  }
}

/**
 * Get a single blog post by ID (admin view, includes deleted)
 */
export async function getBlogPostById(
  id: string
): Promise<{ data: BlogPostRecord | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Post not found' }
      }
      return { data: null, error: error.message }
    }

    return { data: mapToRecord(data), error: null }
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to fetch post' }
  }
}

/**
 * Get all blog posts for admin dashboard (with pagination)
 */
export async function getAdminBlogPosts(options?: {
  page?: number
  limit?: number
  search?: string
  status?: string[]
  includeDeleted?: boolean
}): Promise<{
  data: BlogPostRecord[]
  total: number
  error: string | null
}> {
  if (!isSupabaseConfigured()) {
    return { data: [], total: 0, error: 'Supabase not configured' }
  }

  try {
    const page = options?.page || 1
    const limit = options?.limit || 20
    const includeDeleted = options?.includeDeleted || false
    const search = options?.search
    const status = options?.status

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })

    // Filter deleted
    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    // Search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    // Status filter
    if (status && status.length > 0) {
      query = query.in('status', status)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return { data: [], total: 0, error: error.message }
    }

    return {
      data: data.map(mapToRecord),
      total: count || 0,
      error: null,
    }
  } catch (error: any) {
    return { data: [], total: 0, error: error.message || 'Failed to fetch posts' }
  }
}

/**
 * Duplicate a blog post
 */
export async function duplicateBlogPost(
  id: string,
  userId?: string
): Promise<{ data: BlogPostRecord | null; error: string | null }> {
  const original = await getBlogPostById(id)

  if (original.error || !original.data) {
    return { data: null, error: original.error || 'Post not found' }
  }

  const { data: duplicated, error } = await createBlogPost(
    {
      ...original.data,
      slug: `${original.data.slug}-copy`,
      title: `${original.data.title} (Copy)`,
      status: 'draft',
      featured: false,
    },
    userId
  )

  return { data: duplicated, error }
}

/**
 * Get dashboard statistics
 */
export async function getBlogStats(): Promise<{
  published: number
  draft: number
  scheduled: number
  featured: number
  total: number
  error: string | null
}> {
  if (!isSupabaseConfigured()) {
    return { published: 0, draft: 0, scheduled: 0, featured: 0, total: 0, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts_admin_stats')
      .select('*')

    if (error) {
      return { published: 0, draft: 0, scheduled: 0, featured: 0, total: 0, error: error.message }
    }

    const stats = {
      published: 0,
      draft: 0,
      scheduled: 0,
      featured: 0,
      total: 0,
    }

    data?.forEach(row => {
      if (row.status === 'published') {
        stats.published = row.count
        stats.featured = row.featured_count
      } else if (row.status === 'draft') {
        stats.draft = row.count
      } else if (row.status === 'scheduled') {
        stats.scheduled = row.count
      }
      stats.total += row.count
    })

    return { ...stats, error: null }
  } catch (error: any) {
    return { published: 0, draft: 0, scheduled: 0, featured: 0, total: 0, error: error.message }
  }
}

function mapToRecord(data: any): BlogPostRecord {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description || '',
    content: data.content,
    cover: data.cover || '',
    author: data.author,
    category: data.category,
    tags: data.tags || [],
    featured: data.featured || false,
    status: data.status,
    publishedAt: data.published_at,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    ogImage: data.og_image,
    canonicalUrl: data.canonical_url,
    excerpt: data.excerpt,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    readingTime: data.reading_time || 0,
  }
}