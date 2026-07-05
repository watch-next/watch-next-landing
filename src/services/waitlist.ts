import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { trackEvent, trackWaitlistSubscribe } from './analytics'

export interface WaitlistEntry {
  email: string
  platform: 'android' | 'ios' | 'newsletter' | 'windows' | 'web'
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
 *
 * ENV REQUIREMENTS:
 * - Production (Vercel): VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY MUST be configured
 * - Development (localhost): Can run in mock mode if not configured
 */
export async function joinWaitlist(
  email: string,
  platform: 'android' | 'ios' | 'newsletter' | 'windows' | 'web',
  source: 'hero' | 'newsletter' | 'footer'
): Promise<WaitlistResult> {
  // Environment and configuration check
  const isProduction = import.meta.env.PROD
  const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL
  const hasSupabaseAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY
  const isConfigured = hasSupabaseUrl && hasSupabaseAnonKey

  const trimmedEmail = email.trim().toLowerCase()

  // Basic validation
  if (!trimmedEmail) {

    return { success: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {

    return { success: false, error: 'Please enter a valid email address' }
  }


  // PRODUCTION: Supabase MUST be configured
  if (isProduction && !isConfigured) {

    return {
      success: false,
      error: 'Waitlist service not configured (missing environment variables)'
    }
  }

  // DEVELOPMENT: Can simulate if not configured
  if (!isConfigured) {

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
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

      throw error
    }


    // Track successful waitlist signup (no PII - platform, source, locale only)
    trackEvent(trackWaitlistSubscribe('success', platform, source, locale))

    return { success: true }
  } catch (err) {
    // Log unexpected errors in development

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to join waitlist. Please try again later.',
    }
  }
}

/**
 * Legacy wrapper for backwards compatibility
 */
export async function joinWaitlistLegacy(
  email: string,
  platform: 'android' | 'ios' | 'newsletter' | 'windows' | 'web',
  source: 'hero' | 'newsletter' | 'footer'
): Promise<WaitlistResult> {
  return joinWaitlist(email, platform, source)
}