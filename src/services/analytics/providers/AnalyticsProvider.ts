/**
 * Base interface for analytics providers
 */
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

export interface AnalyticsProvider {
  /**
   * Provider identifier
   */
  readonly name: string

  /**
   * Initialize the provider (load scripts, etc.)
   */
  initialize(config: Record<string, unknown>): Promise<void>

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent): void

  /**
   * Track page navigation
   */
  trackPageView(path: string): void

  /**
   * Check if provider is ready
   */
  isReady(): boolean
}