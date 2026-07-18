import { trackEvent, trackWaitlistSubscribe } from './analytics/index'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const fastApiUrl = import.meta.env.VITE_API_URL

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

// ============================================================================
// Locale helpers
// ============================================================================

function normalizeLocale(locale: string): string {
  const lc = locale.toLowerCase().trim()
  if (lc.startsWith('pt')) return 'pt-BR'
  if (lc.startsWith('es')) return 'es'
  return 'en'
}

function getBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en'
  return normalizeLocale(navigator.language)
}

// ============================================================================
// joinWaitlist – calls the API route instead of direct DB insert
// ============================================================================

export async function joinWaitlist(
  email: string,
  platform: 'android' | 'ios' | 'newsletter' | 'windows' | 'web',
  source: 'hero' | 'newsletter' | 'footer'
): Promise<WaitlistResult> {
  const trimmedEmail = email.trim().toLowerCase()

  // Basic pre-validation (mirrors server-side)
  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: 'Invalid email format' }
  }

  try {
    const response = await fetch(`${fastApiUrl}/api/v1/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trimmedEmail,
        platform,
        source,
        locale: getBrowserLocale(),
      }),
    })

    const result = await response.json().catch(() => null);


    if (!response.ok) {
      result?.detail ||
        result?.message ||
        `HTTP ${response.status}`

      throw new Error(`HTTP error ${response.status}`);

    }



    // Track successful subscription
    trackEvent(trackWaitlistSubscribe('success', platform, source))

    return { success: true }
  } catch (err) {
    console.error('[waitlist] Network error:', err)
    return { success: false, error: 'Network error. Please try again.' }
  }
}