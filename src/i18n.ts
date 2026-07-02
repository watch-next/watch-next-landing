import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

const messages = {
  en,
  'pt-BR': ptBR,
  es,
}

function getBrowserLocale(): string {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language
    if (browserLang === 'pt-BR' || browserLang === 'pt') return 'pt-BR'
    if (browserLang.startsWith('es')) return 'es'
  }
  return 'en'
}

function getSavedLocale(): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('watchnext-locale')
  }
  return null
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale() || getBrowserLocale(),
  fallbackLocale: 'en',
  messages,
  allowComposition: true,
})

export default i18n