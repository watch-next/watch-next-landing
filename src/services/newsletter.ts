import { joinWaitlist } from './waitlist'

import { trackEvent, trackNewsletterSubscribe } from './analytics'

export interface SubscribeResult {
  success: boolean
  duplicate?: boolean
  error?: string
}

/**
 * Gets the current locale for analytics tracking
 */
function getCurrentLocale(): string {
  if (typeof navigator === 'undefined') return 'en'
  const browserLocale = navigator.language.toLowerCase().trim()
  if (browserLocale.startsWith('pt')) return 'pt-BR'
  if (browserLocale.startsWith('es')) return 'es'
  return 'en'
}

/**
 * Subscribes an email to the newsletter by adding it to the waitlist
 * with platform=newsletter and source=newsletter.
 * Reuses the shared waitlist logic for validation, locale normalization,
 * and duplicate handling via database constraint.
 */
export async function subscribeToNewsletter(
  email: string
): Promise<SubscribeResult> {
  const result = await joinWaitlist(email, 'newsletter', 'newsletter')

  // Track successful newsletter subscription (no PII - locale only)
  if (result.success) {
    trackEvent(trackNewsletterSubscribe('success', getCurrentLocale()))
  }

  return {
    success: result.success,
    duplicate: result.duplicate,
    error: result.duplicate ? 'This email is already subscribed' : result.error,
  }
}