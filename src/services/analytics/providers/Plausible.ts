import type { AnalyticsProvider, AnalyticsEvent } from './AnalyticsProvider'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void
  }
}

export interface PlausibleConfig {
  domain: string
  selfHosted?: boolean
  selfHostedUrl?: string
}

export class PlausibleAnalytics implements AnalyticsProvider {
  readonly name = 'Plausible'
  private config: PlausibleConfig | null = null
  private initialized = false

  async initialize(config: Record<string, unknown>): Promise<void> {
    const plausibleConfig = config as PlausibleConfig
    if (!plausibleConfig.domain) {
      throw new Error('Plausible: domain is required')
    }

    this.config = plausibleConfig

    if (typeof window !== 'undefined') {
      // Setup plausible queue
      window.plausible = window.plausible || function () {
        const args = Array.from(arguments) as [string, { props?: Record<string, unknown> }?]
        if (window.plausible) {
          (window.plausible as (event: string, options?: { props?: Record<string, unknown> }) => void).apply(null, args)
        }
      }

      // Whether to use self-hosted or cloud
      const scriptUrl = plausibleConfig.selfHosted
        ? plausibleConfig.selfHostedUrl || plausibleConfig.domain
        : `https://plausible.io/js/script.js`

      const script = document.createElement('script')
      script.defer = true
      script.src = scriptUrl
      script.dataset.domain = plausibleConfig.domain
      document.head.appendChild(script)

      script.onload = () => {
        this.initialized = true
      }
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.plausible) {
      return
    }
    window.plausible(event.name, { props: event.properties })
  }

  trackPageView(): void {
    if (!this.initialized || !window.plausible) {
      return
    }
    // Plausible tracks page views automatically
    window.plausible('pageview')
  }

  isReady(): boolean {
    return this.initialized
  }
}