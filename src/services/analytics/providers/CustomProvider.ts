/**
 * Add provider-specific properties to events
 */
export interface ExtendedAnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  /**
   * Provider-specific metadata (optional)
   */
  meta?: {
    provider?: string
    timestamp?: number
  }
}

/**
 * Custom provider interface for extending the analytics service
 */
export interface CustomAnalyticsProvider {
  readonly name: string
  initialize(config: Record<string, unknown>): Promise<void>
  trackEvent(event: ExtendedAnalyticsEvent): void
  trackPageView(path: string): void
  isReady(): boolean
}