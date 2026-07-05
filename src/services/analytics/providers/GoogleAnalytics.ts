import type { AnalyticsProvider, AnalyticsEvent } from './AnalyticsProvider'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export interface GAConfig {
  measurementId: string
}

export class GoogleAnalytics implements AnalyticsProvider {
  readonly name = 'GoogleAnalytics'
  private config: GAConfig | null = null
  private initialized = false

  async initialize(config: GAConfig): Promise<void> {
    if (!config.measurementId) {
      throw new Error('GoogleAnalytics: measurementId is required')
    }

    this.config = config

    // Load gtag script
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      script.onload = () => {
        window.gtag = window.gtag || function () {
          const args = Array.from(arguments)
          if (window.gtag) {
            (window.gtag as (...args: unknown[]) => void).apply(null, args)
          }
        }
        window.gtag('js', new Date())
        window.gtag('config', config.measurementId)
        this.initialized = true
      }
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