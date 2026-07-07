/**
 * Supabase Storage Integration for Blog Images
 *
 * Provides utilities for uploading and retrieving blog cover images.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const BUCKET_NAME = 'blog-images'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  url: string | null
  error: string | null
}

/**
 * Validate image file before upload
 */
function validateImageFile(file: File): { valid: boolean; error: string | null } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  // Check filename
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    return {
      valid: false,
      error: 'Filename can only contain letters, numbers, dots, underscores, and hyphens',
    }
  }

  return { valid: true, error: null }
}

/**
 * Upload a blog cover image to Supabase Storage
 *
 * @param file - The image file to upload
 * @param slug - The blog post slug (used for file naming)
 * @returns Object with URL on success or error message on failure
 */
export async function uploadBlogCover(
  file: File,
  slug: string
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { url: null, error: 'Supabase not configured' }
  }

  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: null, error: validation.error }
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${slug}-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading blog cover:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

    return { url: publicUrl, error: null }
  } catch (error: any) {
    console.error('Unexpected error uploading blog cover:', error)
    return { url: null, error: error.message || 'Failed to upload image' }
  }
}

/**
 * Delete a blog cover image from Supabase Storage
 *
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteBlogCover(imageUrl: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    // Extract filename from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const fileName = pathParts[pathParts.length - 1]

    if (fileName) {
      await supabase.storage.from(BUCKET_NAME).remove([fileName])
    }
  } catch (error) {
    console.error('Error deleting blog cover:', error)
  }
}

/**
 * Get the public URL for a blog cover image
 *
 * @param fileName - The filename of the image in storage
 */
export function getBlogCoverUrl(fileName: string): string {
  if (!isSupabaseConfigured()) {
    return ''
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

  return publicUrl
}

/**
 * Get all uploaded blog images
 *
 * @returns Array of image filenames
 */
export async function listBlogImages(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        offset: 0,
      })

    if (error) {
      console.error('Error listing blog images:', error)
      return []
    }

    return data.map(file => file.name)
  } catch (error) {
    console.error('Unexpected error listing blog images:', error)
    return []
  }
}