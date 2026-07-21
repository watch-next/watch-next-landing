/**
 * Composable para gerenciamento do Google AdSense
 *
 * Responsável por:
 * - Validar configuração do Publisher ID
 * - Carregar script do AdSense uma única vez
 * - Inicializar anúncios após navegação entre rotas
 * - Evitar erros em ambiente de desenvolvimento
 */

let adsenseInitialized = false
let loadPromise: Promise<void> | null = null

export interface AdSenseConfig {
  publisherId: string
  testMode?: boolean
}

export interface AdSlotOptions {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  layout?: 'in-article' | 'in-feed' | 'fixed'
  responsive?: boolean
  class?: string
}

/**
 * Carrega o script do AdSense uma única vez
 */
function loadAdsenseScript(): Promise<void> {
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID
    const cleanPublisherId = publisherId ? publisherId.replace('ca-pub-', '') : ''

    if (!cleanPublisherId) {
      reject(new Error('[AdSense] Publisher ID not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${cleanPublisherId}`
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      adsenseInitialized = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load AdSense script'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Verifica se o Publisher ID está configurado
 */
function isAdsenseConfigured(): boolean {
  const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID
  return !!(publisherId && publisherId !== 'ca-pub-XXXXXXXXXXXXXXXX' && publisherId.trim() !== '')
}

/**
 * Empurra um anúncio para a fila de renderização do AdSense
 */
function pushAd(): void {
  if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
    try {
      (window as any).adsbygoogle.push({})
    } catch (error) {
      // Silenciar erros em desenvolvimento ou quando AdSense não está disponível
      if (import.meta.env.PROD) {
        console.warn('[AdSense] Failed to push ad:', error)
      }
    }
  }
}

/**
 * Inicializa um elemento de anúncio específico
 */
function initAdElement(element: HTMLElement, options: AdSlotOptions): void {
  if (!isAdsenseConfigured()) {
    if (import.meta.env.DEV) {
      console.log('[AdSense] Not configured - showing placeholder')
    }
    return
  }

  // Configurar atributos data- para o AdSense
  element.setAttribute('data-ad-client', `ca-pub-${import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID?.replace('ca-pub-', '') || ''}`)

  if (options.slot) {
    element.setAttribute('data-ad-slot', options.slot)
  }

  if (options.format) {
    element.setAttribute('data-ad-format', options.format)
  }

  if (options.layout) {
    element.setAttribute('data-ad-layout', options.layout)
  }

  if (options.responsive !== false) {
    element.setAttribute('data-full-width-responsive', 'true')
  }

  // Empurrar para a fila do AdSense
  pushAd()
}

/**
 * Composable principal
 */
export function useAdSense() {
  /**
   * inicializa o AdSense para a página atual
   * Deve ser chamado no onMounted de cada página que exibe anúncios
   */
  async function initialize(): Promise<void> {
    if (!isAdsenseConfigured()) {
      if (import.meta.env.DEV) {
        console.log('[AdSense] Skipping initialization - not configured')
      }
      return
    }

    if (!adsenseInitialized) {
      try {
        await loadAdsenseScript()
      } catch (error) {
        console.warn('[AdSense] Script load failed:', error)
        return
      }
    }

    // Empurrar anúncios existentes na página
    setTimeout(() => {
      pushAd()
    }, 100)
  }

  /**
   * Força re-inicialização dos anúncios (útil após navegação)
   */
  function refresh(): void {
    if (!isAdsenseConfigured() || !adsenseInitialized) {
      return
    }
    pushAd()
  }

  /**
   * Verifica se o AdSense está configurado
   */
  function getConfigured(): boolean {
    return isAdsenseConfigured()
  }

  /**
   * Verifica se o script foi carregado
   */
  function isInitialized(): boolean {
    return adsenseInitialized
  }

  return {
    initialize,
    refresh,
    getConfigured,
    isInitialized,
  }
}

export { isAdsenseConfigured, pushAd, initAdElement }