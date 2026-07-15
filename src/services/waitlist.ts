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

    // Call Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/join-waitlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: trimmedEmail,
          platform,
          source,
          locale,
        }),
      }
    )

    let responseData: { success?: boolean; duplicate?: boolean; error?: string; message?: string }

    try {
      responseData = await response.json()
    } catch {
      // If response is not JSON, use status-based defaults
      responseData = {}
    }

    // Handle non-200 responses
    if (!response.ok) {
      // 409 Conflict = duplicate registration
      if (response.status === 409) {
        const platformLabel = platform === 'ios' ? 'iOS' : platform === 'newsletter' ? 'Newsletter' : platform === 'windows' ? 'Windows' : 'Android'
        return {
          success: false,
          duplicate: true,
          error: responseData.error || `You're already on the ${platformLabel} waitlist`,
        }
      }

      // 400 Bad Request = validation error
      if (response.status === 400) {
        return {
          success: false,
          error: responseData.error || 'Invalid request',
        }
      }

      // Other errors (500, 503, etc.)
      return {
        success: false,
        error: responseData.error || 'Unexpected error. Please try again later.',
      }
    }

    // Success response
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