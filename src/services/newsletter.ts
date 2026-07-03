import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface NewsletterSubscription {
  email: string
  source: 'newsletter'
  locale: string
  created_at: string
}

export interface SubscribeResult {
  success: boolean
  duplicate?: boolean
  error?: string
}

/**
 * Normalizes browser locale to supported values: pt-BR, en, es
 */
function normalizeLocale(locale: string): 'pt-BR' | 'en' | 'es' {
  const normalized = locale.toLowerCase().trim()

  // Portuguese variants
  if (normalized.startsWith('pt')) {
    return 'pt-BR'
  }

  // Spanish variants
  if (normalized.startsWith('es')) {
    return 'es'
  }

  // Default to English for all other locales
  return 'en'
}

/**
 * Subscribes an email to the newsletter.
 * Handles validation, duplicate prevention via database constraint.
 */
export async function subscribeToNewsletter(
  email: string
): Promise<SubscribeResult> {
  const trimmedEmail = email.trim().toLowerCase()

  // Basic validation
  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  // If Supabase is not configured, simulate success (for development)
  if (!isSupabaseConfigured()) {
    console.warn(`[Dev Mode] Newsletter subscription simulated: ${trimmedEmail}`)
    return { success: true }
  }

  try {
    // Normalize locale to supported values
    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en'
    const locale = normalizeLocale(browserLocale)

    // Single INSERT - let PostgreSQL UNIQUE constraint handle duplicates
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: trimmedEmail,
        source: 'newsletter',
        locale,
      })

    if (error) {
      // Check for unique constraint violation (duplicate entry)
      if (error.code === '23505') {
        return { success: false, duplicate: true, error: 'This email is already subscribed' }
      }

      // Log unexpected errors in development
      console.error('Newsletter insert failed:', error)
      throw error
    }

    return { success: true }
  } catch (err) {
    // Log unexpected errors in development
    console.error('Newsletter subscription failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to subscribe. Please try again later.',
    }
  }
}