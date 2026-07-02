import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface NewsletterSubscription {
  email: string
  subscribed_at: string
}

export interface SubscribeResult {
  success: boolean
  duplicate?: boolean
  error?: string
}

/**
 * Subscribes an email to the newsletter.
 * Handles validation, duplicate prevention, and error states.
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
    console.log('[Dev Mode] Newsletter subscription simulated:', trimmedEmail)
    return { success: true }
  }

  try {
    // Check for existing subscription (duplicate prevention)
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', trimmedEmail)
      .single()

    if (existing) {
      return { success: false, duplicate: true, error: 'This email is already subscribed' }
    }

    // Insert new subscription
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: trimmedEmail,
        subscribed_at: new Date().toISOString(),
      })

    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error('Newsletter subscription failed:', err)
    return {
      success: false,
      error: 'Failed to subscribe. Please try again later.',
    }
  }
}