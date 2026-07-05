import type { AnalyticsProvider, AnalyticsEvent } from './AnalyticsProvider'

declare global {
  interface Window {
    posthog?: {
      init: (apiKey: string, options: Record<string, unknown>) => void
      capture: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}

export interface PostHogConfig {
  apiKey: string
  host?: string
}

export class PostHogAnalytics implements AnalyticsProvider {
  readonly name = 'PostHog'
  private config: PostHogConfig | null = null
  private initialized = false

  async initialize(config: Record<string, unknown>): Promise<void> {
    const postHogConfig = config as PostHogConfig
    if (!postHogConfig.apiKey) {
      throw new Error('PostHog: apiKey is required')
    }

    this.config = postHogConfig

    if (typeof window !== 'undefined') {
      // Load PostHog script
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/posthog-js@latest/dist/posthog.min.js'
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.posthog) {
          window.posthog.init(postHogConfig.apiKey, {
            api_host: postHogConfig.host || 'https://app.posthog.com',
          })
          this.initialized = true
        }
      }
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.posthog) {
      return
    }
    window.posthog.capture(event.name, event.properties)
  }

  trackPageView(path: string): void {
    if (!this.initialized || !window.posthog) {
      return
    }
    window.posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
    })
  }

  isReady(): boolean {
    return this.initialized
  }
}