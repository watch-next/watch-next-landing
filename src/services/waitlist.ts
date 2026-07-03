import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface WaitlistEntry {
  email: string
  platform: 'android' | 'ios' | 'newsletter' | 'windows'
  source: 'hero' | 'newsletter' | 'footer'
  locale: string
  created_at: string
}

export interface WaitlistResult {
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
 * Adds an email to the waitlist for a specific platform.
 * Handles duplicate prevention via database constraint.
 */
export async function joinWaitlist(
  email: string,
  platform: 'android' | 'ios' | 'newsletter' | 'windows',
  source: 'hero' | 'newsletter' | 'footer'
): Promise<WaitlistResult> {
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
    console.warn(`[Dev Mode] Waitlist join simulated: ${trimmedEmail} (${platform}, ${source})`)
    return { success: true }
  }

  try {
    // Normalize locale to supported values
    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en'
    const locale = normalizeLocale(browserLocale)

    // Single INSERT - let PostgreSQL UNIQUE constraint handle duplicates
    const { error } = await supabase.from('waitlist_entries').insert({
      email: trimmedEmail,
      platform,
      source,
      locale,
    })

    if (error) {
      // Check for unique constraint violation (duplicate entry)
      if (error.code === '23505') {
        const platformLabel = platform === 'ios' ? 'iOS' : platform === 'newsletter' ? 'Newsletter' : platform === 'windows' ? 'Windows' : 'Android'
        return {
          success: false,
          duplicate: true,
          error: `You're already on the ${platformLabel} waitlist`,
        }
      }

      // Log unexpected errors in development
      console.error('Waitlist insert failed:', error)
      throw error
    }

    return { success: true }
  } catch (err) {
    // Log unexpected errors in development
    console.error('Waitlist join failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to join waitlist. Please try again later.',
    }
  }
}