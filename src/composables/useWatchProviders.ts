/**
 * Composable para gerenciar watch providers de filmes
 */

import { ref, type Ref, readonly } from 'vue'
import { getWatchProviders, type WatchProvidersResponse, type WatchProvider } from '@/services/movie.service'

export interface ProviderSection {
  key: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads'
  label: string
  providers: WatchProvider[]
}

export interface UseWatchProvidersReturn {
  providers: Ref<WatchProvidersResponse | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  hasProviders: Ref<boolean>
  providerSections: Ref<ProviderSection[]>
  loadedMovieId: Ref<string | null>
  loadProviders: (movieId: string, region?: string) => Promise<void>
}

/**
 * Composable para carregar e gerenciar watch providers
 */
export function useWatchProviders(): UseWatchProvidersReturn {
  const providers = ref<WatchProvidersResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Verifica se existem providers disponíveis
   */
  const hasProviders = ref(false)

  /**
   * Retorna providers organizados por seção para renderização
   */
  const providerSections = ref<ProviderSection[]>([])

  /**
   * Rastreia qual movieId já foi carregado (evita re-carregamento)
   */
  const loadedMovieId = ref<string | null>(null)

  /**
   * Carrega os watch providers para um filme
   * @param movieId - UUID do filme no backend
   * @param region - Código da região (padrão: 'US')
   */
  async function loadProviders(movieId: string, region: string = 'US'): Promise<void> {
    // Evita re-carregar se já carregou para este movieId
    if (loadedMovieId.value === movieId && !isLoading.value) {
      return
    }

    // Marca como carregando ANTES da requisição para evitar loop
    loadedMovieId.value = movieId
    isLoading.value = true
    error.value = null

    try {
      const response = await getWatchProviders(movieId, region)
      providers.value = response

      // Organiza providers por categoria
      const sections: ProviderSection[] = []
      const sectionLabels: Record<string, string> = {
        flatrate: 'movie.providers.streaming',
        rent: 'movie.providers.rent',
        buy: 'movie.providers.buy',
        free: 'movie.providers.free',
        ads: 'movie.providers.ads',
      }

      // Itera nas chaves na ordem desejada
      const orderedKeys: ('flatrate' | 'rent' | 'buy' | 'free' | 'ads')[] = [
        'flatrate',
        'rent',
        'buy',
        'free',
        'ads',
      ]

      for (const key of orderedKeys) {
        const providerList = response[key]
        if (providerList && providerList.length > 0) {
          sections.push({
            key,
            label: sectionLabels[key],
            providers: providerList,
          })
        }
      }

      providerSections.value = sections
      hasProviders.value = sections.length > 0
    } catch (err) {
      // ERRO 429 ou 404: marca como carregado com hasProviders=false para evitar loop
      error.value = err instanceof Error ? err : new Error('Failed to load watch providers')
      providers.value = null
      hasProviders.value = false
    } finally {
      isLoading.value = false
    }
  }

  return {
    providers,
    isLoading,
    error,
    hasProviders,
    providerSections,
    loadedMovieId: readonly(loadedMovieId),
    loadProviders,
  }
}