import { joinWaitlist } from './waitlist'

export interface SubscribeResult {
  success: boolean
  duplicate?: boolean
  error?: string
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

  return {
    success: result.success,
    duplicate: result.duplicate,
    error: result.duplicate ? 'This email is already subscribed' : result.error,
  }
}