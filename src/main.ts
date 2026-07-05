import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Root from './Root.vue'
import router from './router'
import './style/global.scss'

// Import locale files
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

// Import analytics service
import { analytics } from './services/analytics'

// Detect browser language
function getBrowserLanguage(): string {
  // Check localStorage first
  const savedLang = localStorage.getItem('watchnext-locale')
  if (savedLang && ['en', 'pt-BR', 'es'].includes(savedLang)) {
    return savedLang
  }
  // Fall back to browser language
  const browserLang = navigator.language
  if (browserLang.startsWith('pt')) return 'pt-BR'
  if (browserLang.startsWith('es')) return 'es'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    'pt-BR': ptBR,
    es,
  },
})

// Initialize analytics with environment-configured providers
const analyticsConfig = {
  providers: {
    googleAnalytics: import.meta.env.VITE_GA_MEASUREMENT_ID
      ? { measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID }
      : undefined,
    plausible: import.meta.env.VITE_PLAUSIBLE_DOMAIN
      ? {
          domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN,
          selfHosted: import.meta.env.VITE_PLAUSIBLE_SELF_HOSTED === 'true',
          selfHostedUrl: import.meta.env.VITE_PLAUSIBLE_HOST,
        }
      : undefined,
    posthog: import.meta.env.VITE_POSTHOG_API_KEY
      ? {
          apiKey: import.meta.env.VITE_POSTHOG_API_KEY,
          host: import.meta.env.VITE_POSTHOG_HOST,
        }
      : undefined,
  },
}

// Only initialize if at least one provider is configured
const hasProviders = Object.values(analyticsConfig.providers).some(Boolean)
if (hasProviders) {
  analytics.initialize(analyticsConfig)
  // Track initial page view
  analytics.trackPageView()
}

const app = createApp(Root)
app.use(i18n)
app.use(router)
app.mount('#app')