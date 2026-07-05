import type { AnalyticsEvent } from './providers/AnalyticsProvider'
import { AnalyticsEvents, type AnalyticsEventName } from './events'

/**
 * Type-safe event tracking helper
 */
export function createAnalyticsEvent(
  name: AnalyticsEventName,
  properties?: Record<string, unknown>
): AnalyticsEvent {
  return { name, properties }
}

/**
 * Navigation event helper
 */
export function trackNavigation(item: string, location?: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.NAVIGATION_CLICK, { item, location })
}

/**
 * Hero CTA event helper
 */
export function trackHeroCta(action: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.HERO_CTA_CLICK, { action })
}

/**
 * Download button event helper
 */
export function trackDownload(
  platform: 'windows' | 'android' | 'macos' | 'web',
  location: 'hero' | 'features' | 'footer'
): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.DOWNLOAD_CLICK, { platform, location })
}

/**
 * Newsletter subscription event helper
 */
export function trackNewsletterSubscribe(
  status: 'initiated' | 'success' | 'error',
  locale?: string
): AnalyticsEvent {
  const eventName =
    status === 'success'
      ? AnalyticsEvents.NEWSLETTER_SUBSCRIBE_SUCCESS
      : status === 'error'
        ? AnalyticsEvents.NEWSLETTER_SUBSCRIBE_ERROR
        : AnalyticsEvents.NEWSLETTER_SUBSCRIBE

  return createAnalyticsEvent(eventName, { status, locale })
}

/**
 * Waitlist subscription event helper
 */
export function trackWaitlistSubscribe(
  status: 'initiated' | 'success' | 'error',
  platform?: string,
  source?: string,
  locale?: string
): AnalyticsEvent {
  const eventName =
    status === 'success'
      ? AnalyticsEvents.WAITLIST_SUBSCRIBE_SUCCESS
      : status === 'error'
        ? AnalyticsEvents.WAITLIST_SUBSCRIBE_ERROR
        : AnalyticsEvents.WAITLIST_SUBSCRIBE

  return createAnalyticsEvent(eventName, { status, platform, source, locale })
}

/**
 * Premium CTA event helper
 */
export function trackPremiumCta(action: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.PREMIUM_CTA_CLICK, { action })
}

/**
 * Language change event helper
 */
export function trackLanguageChange(from: string, to: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.LANGUAGE_CHANGE, { from, to })
}

/**
 * Footer link event helper
 */
export function trackFooterLink(label: string, href?: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.FOOTER_LINK_CLICK, { label, href })
}

/**
 * Social link event helper
 */
export function trackSocialClick(platform: string, url?: string): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.SOCIAL_CLICK, { platform, url })
}

/**
 * Page view event helper - fires once on initial page load
 */
export function trackPageView(): AnalyticsEvent {
  return createAnalyticsEvent(AnalyticsEvents.PAGE_VIEW)
}