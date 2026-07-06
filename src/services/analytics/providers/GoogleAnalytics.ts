import type { AnalyticsProvider, AnalyticsEvent } from './AnalyticsProvider'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export interface GAConfig {
  measurementId: string
}

export class GoogleAnalytics implements AnalyticsProvider {
  readonly name = 'GoogleAnalytics'
  private measurementId: string | null = null
  private initialized = false

  async initialize(config: Record<string, unknown>): Promise<void> {
    const measurementId = config.measurementId as string | undefined
    if (!measurementId) {
      throw new Error('GoogleAnalytics: measurementId is required')
    }

    this.measurementId = measurementId

    // gtag is already loaded globally via index.html
    // Just wait for it to be ready
    if (typeof window !== 'undefined') {
      const waitForGtag = (): Promise<void> => {
        return new Promise((resolve) => {
          const checkGtag = () => {
            if (window.gtag) {
              this.initialized = true
              resolve()
            } else {
              setTimeout(checkGtag, 50)
            }
          }
          checkGtag()
        })
      }

      await waitForGtag()
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.gtag) {
      return
    }
    window.gtag('event', event.name, event.properties || {})
  }

  trackPageView(path: string): void {
    if (!this.initialized || !window.gtag) {
      return
    }
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_path: path,
    })
  }

  isReady(): boolean {
    return this.initialized
  }
}