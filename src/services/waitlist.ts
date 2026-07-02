import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface WaitlistEntry {
  email: string
  platform: 'android' | 'ios'
  joined_at: string
}

export interface WaitlistResult {
  success: boolean
  duplicate?: boolean
  error?: string
}

/**
 * Adds an email to the waitlist for a specific platform.
 * Handles duplicate prevention and error states.
 */
export async function joinWaitlist(
  email: string,
  platform: 'android' | 'ios'
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
    console.log(`[Dev Mode] Waitlist join simulated: ${trimmedEmail} (${platform})`)
    return { success: true }
  }

  try {
    // Check for existing entry (duplicate prevention)
    const { data: existing } = await supabase
      .from('waitlist_entries')
      .select('id')
      .eq('email', trimmedEmail)
      .eq('platform', platform)
      .single()

    if (existing) {
      return {
        success: false,
        duplicate: true,
        error: `You're already on the ${platform === 'ios' ? 'iOS' : 'Android'} waitlist`,
      }
    }

    // Insert new entry
    const { error } = await supabase.from('waitlist_entries').insert({
      email: trimmedEmail,
      platform,
      joined_at: new Date().toISOString(),
    })

    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error('Waitlist join failed:', err)
    return {
      success: false,
      error: 'Failed to join waitlist. Please try again later.',
    }
  }
}