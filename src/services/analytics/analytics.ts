import type { AnalyticsProvider, AnalyticsEvent } from './providers/AnalyticsProvider'

export type AnalyticsProviderType = 'googleAnalytics' | 'plausible' | 'posthog'

export interface AnalyticsConfig {
  providers: {
    googleAnalytics?: { measurementId: string }
    plausible?: { domain: string; selfHosted?: boolean; selfHostedUrl?: string }
    posthog?: { apiKey: string; host?: string }
  }
}

/**
 * Centralized analytics service
 * Manages multiple analytics providers with a unified interface
 */
export class AnalyticsService {
  private providers: Map<string, AnalyticsProvider> = new Map()
  private initialized = false
  private eventQueue: AnalyticsEvent[] = []

  /**
   * Initialize configured providers
   */
  async initialize(config: AnalyticsConfig): Promise<void> {
    if (this.initialized) {
      return
    }

    const { providers } = config

    // Initialize each configured provider
    const initPromises: Promise<void>[] = []

    if (providers.googleAnalytics) {
      initPromises.push(this.registerProvider('googleAnalytics', providers.googleAnalytics))
    }

    if (providers.plausible) {
      initPromises.push(this.registerProvider('plausible', providers.plausible))
    }

    if (providers.posthog) {
      initPromises.push(this.registerProvider('posthog', providers.posthog))
    }

    await Promise.all(initPromises)
    this.initialized = true

    // Process queued events
    this.eventQueue.forEach((event) => this.trackEventInternal(event))
    this.eventQueue = []
  }

  /**
   * Register and initialize a provider
   */
  private async registerProvider(
    type: AnalyticsProviderType,
    config: Record<string, unknown>
  ): Promise<void> {
    let provider: AnalyticsProvider

    switch (type) {
      case 'googleAnalytics':
        const { GoogleAnalytics } = await import('./providers/GoogleAnalytics')
        provider = new GoogleAnalytics()
        break
      case 'plausible':
        const { PlausibleAnalytics } = await import('./providers/Plausible')
        provider = new PlausibleAnalytics()
        break
      case 'posthog':
        const { PostHogAnalytics } = await import('./providers/PostHog')
        provider = new PostHogAnalytics()
        break
      default:
        console.warn(`Unknown analytics provider: ${type}`)
        return
    }

    try {
      await provider.initialize(config)
      this.providers.set(type, provider)
      console.log(`Analytics provider initialized: ${provider.name}`)
    } catch (error) {
      console.error(`Failed to initialize ${provider.name}:`, error)
    }
  }

  /**
   * Track an event across all providers
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      this.eventQueue.push(event)
      return
    }
    this.trackEventInternal(event)
  }

  /**
   * Internal event tracking (post-initialization)
   */
  private trackEventInternal(event: AnalyticsEvent): void {
    this.providers.forEach((provider) => {
      if (provider.isReady()) {
        provider.trackEvent(event)
      }
    })
  }

  /**
   * Track a page view
   */
  trackPageView(path?: string): void {
    if (!this.initialized) {
      return
    }
    const pagePath = path || window.location.pathname
    this.providers.forEach((provider) => {
      if (provider.isReady()) {
        provider.trackPageView(pagePath)
      }
    })
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get active providers count
   */
  getActiveProvidersCount(): number {
    let count = 0
    this.providers.forEach((provider) => {
      if (provider.isReady()) count++
    })
    return count
  }
}

export const analytics = new AnalyticsService()
export default analytics