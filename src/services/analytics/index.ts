/**
 * Analytics Service for Watch Next
 *
 * Centralized event tracking supporting multiple providers:
 * - Google Analytics
 * - Plausible
 * - PostHog
 *
 * @example
 * ```ts
 * // Initialize with providers
 * await analytics.initialize({
 *   providers: {
 *     googleAnalytics: { measurementId: 'G-XXXXXX' },
 *     plausible: { domain: 'example.com' },
 *   }
 * })
 *
 * // Track events
 * analytics.trackEvent(trackNavigation('Home', 'header'))
 * analytics.trackEvent(trackHeroCta('download'))
 * ```
 */

// Core service
export { analytics, AnalyticsService } from './analytics'
export type { AnalyticsConfig, AnalyticsProviderType } from './analytics'

// Provider interface for custom implementations
export type { AnalyticsProvider, AnalyticsEvent } from './providers/AnalyticsProvider'

// Event constants
export { AnalyticsEvents } from './events'
export type { AnalyticsEventName } from './events'

// Typed event helpers
export {
  createAnalyticsEvent,
  trackNavigation,
  trackHeroCta,
  trackDownload,
  trackNewsletterSubscribe,
  trackWaitlistSubscribe,
  trackPremiumCta,
  trackLanguageChange,
  trackFooterLink,
  trackSocialClick,
} from './helpers'

import { analytics } from './analytics'

/**
 * Convenience function for tracking events
 * Usage: trackEvent(trackNavigation('Home', 'header'))
 */
export function trackEvent(event: { name: string; properties?: Record<string, unknown> }): void {
  analytics.trackEvent(event)
}