/**
 * Analytics event types for Watch Next
 */

export const AnalyticsEvents = {
  // Navigation
  NAVIGATION_CLICK: 'navigation_click',

  // Hero Section
  HERO_CTA_CLICK: 'hero_cta_click',
  HERO_DOWNLOAD_CLICK: 'hero_download_click',

  // Download buttons (anywhere in app)
  DOWNLOAD_CLICK: 'download_click',

  // Newsletter
  NEWSLETTER_SUBSCRIBE: 'newsletter_subscribe',
  NEWSLETTER_SUBSCRIBE_SUCCESS: 'newsletter_subscribe_success',
  NEWSLETTER_SUBSCRIBE_ERROR: 'newsletter_subscribe_error',

  // Waitlist
  WAITLIST_SUBSCRIBE: 'waitlist_subscribe',
  WAITLIST_SUBSCRIBE_SUCCESS: 'waitlist_subscribe_success',
  WAITLIST_SUBSCRIBE_ERROR: 'waitlist_subscribe_error',

  // Premium
  PREMIUM_CTA_CLICK: 'premium_cta_click',

  // Language
  LANGUAGE_CHANGE: 'language_change',

  // Footer
  FOOTER_LINK_CLICK: 'footer_link_click',

  // Social
  SOCIAL_CLICK: 'social_click',

  // Page View
  PAGE_VIEW: 'page_view',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]