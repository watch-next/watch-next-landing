<template>
  <article v-if="movie" class="movie-page">
    <div class="container movie-page__container">
      <!-- Breadcrumb -->
      <Breadcrumbs :items="breadcrumbItems" />

      <!-- Header with Poster and Backdrop -->
      <header class="movie-page__header">
        <div class="movie-page__media">
          <div class="movie-page__poster">
            <img
              v-if="posterUrl"
              :src="posterUrl"
              :alt="movie.title"
              class="movie-page__poster-img"
              loading="lazy"
            />
            <div v-else class="movie-page__poster-placeholder">
              <span>🎬</span>
              <p>{{ t('movie.no_poster') }}</p>
            </div>
          </div>
          
        </div>

        <div class="movie-page__info">
          <h1 class="movie-page__title">{{ movie.title }}</h1>

          <p v-if="movie.original_title && movie.original_title !== movie.title" class="movie-page__original-title">
            <span class="label">{{ t('movie.original_title') }}:</span> {{ movie.original_title }}
          </p>

          <p v-if="movie.tagline" class="movie-page__tagline">"{{ movie.tagline }}"</p>

          <div class="movie-page__meta">
            <span class="movie-page__year" v-if="releaseYear">
              📅 {{ releaseYear }}
            </span>
            <span class="movie-page__duration" v-if="movie.runtime_minutes">
              ⏱️ {{ formatDuration(movie.runtime_minutes) }}
            </span>
            <span class="movie-page__status" v-if="movie.status">
              {{ movie.status }}
            </span>
            <span class="movie-page__popularity" v-if="movie.popularity">
              🔥 {{ t('movie.popularity') }}: {{ movie.popularity.toFixed(0) }}
            </span>
          </div>

          <!-- Ratings -->
          <div class="movie-page__ratings" v-if="movie.vote_average !== null || movie.vote_count">
            <div class="ratings__stars">
              <span class="ratings__icon">⭐</span>
              <span class="ratings__value">{{ movie.vote_average?.toFixed(1) ?? 'N/A' }}</span>
              <span class="ratings__max">/ 10</span>
            </div>
            <span class="ratings__count" v-if="movie.vote_count">
              ({{ movie.vote_count.toLocaleString() }} {{ t('movie.votes') }})
            </span>
          </div>

          <!-- Genres as Chips -->
          <div class="movie-page__genres" v-if="movie.genres && movie.genres.length">
            <Chip
              v-for="genre in movie.genres"
              :key="genre.id"
              :label="genre.name"
            />
          </div>

          <!-- Synopsis -->
          <section class="movie-page__synopsis">
            <h2 class="synopsis__title">{{ t('movie.synopsis') }}</h2>
            <p v-if="movie.overview" class="synopsis__content">{{ movie.overview }}</p>
            <p v-else class="synopsis__empty">{{ t('movie.no_synopsis') }}</p>
          </section>

           <!--Financial Info 
          <section class="movie-page__financial" v-if="movie.budget || movie.revenue">
            <h2 class="financial__title">{{ t('movie.financial') }}</h2>
            <div class="financial__grid">
              <div v-if="movie.budget" class="financial__item">
                <span class="financial__label">{{ t('movie.budget') }}</span>
                <span class="financial__value">{{ formatMoney(movie.budget) }}</span>
              </div>
              <div v-if="movie.revenue" class="financial__item">
                <span class="financial__label">{{ t('movie.revenue') }}</span>
                <span class="financial__value">{{ formatMoney(movie.revenue) }}</span>
              </div>
            </div>
          </section> -->

          
        </div>
      </header>

      <!-- Action Buttons (aligned in block) -->
      <div class="movie-page__actions">
        <a
          v-if="movie.homepage"
          :href="movie.homepage"
          target="_blank"
          rel="noopener noreferrer"
          class="movie-page__btn movie-page__btn--homepage"
        >
          🌐 {{ t('movie.official_site') }}
          <span class="external-link-icon">↗</span>
        </a>
        <button
          @click="showWatchModal = true"
          class="movie-page__btn movie-page__btn--watch"
          :disabled="isLoadingProviders"
        >
          <span v-if="isLoadingProviders">{{ t('common.loading') }}...</span>
          <span v-else>📺 {{ t('movie.watch_now') }}</span>
        </button>
      </div>

      <!-- AdSense Banner -->
      <AdSenseAd
        format="auto"
        layout="in-feed"
        responsive
        class="movie-page__ad"
      />
    </div>
  </article>

  <div v-else-if="isLoading" class="container movie-page__loading">
    <div class="movie-page__skeleton">
      <div class="movie-page__skeleton-poster"></div>
      <div class="movie-page__skeleton-info">
        <div class="movie-page__skeleton-title"></div>
        <div class="movie-page__skeleton-meta"></div>
        <div class="movie-page__skeleton-overview"></div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="container movie-page__error">
    <p>{{ error === 404 ? t('movie.not_found') : t('common.error') }}</p>
  </div>

  <!-- Watch Providers Modal -->
  <div v-if="showWatchModal" class="modal-overlay" @click="showWatchModal = false">
    <div class="modal" @click.stop>
      <div class="modal__header">
        <h2>{{ t('movie.watch_now') }}</h2>
        <button class="modal__close" @click="showWatchModal = false">×</button>
      </div>

      <div class="modal__content">
        <div v-if="isLoadingProviders" class="providers__loading">
          <p>{{ t('common.loading') }}...</p>
        </div>

        <div v-else-if="!hasProviders" class="providers__empty">
          <p>{{ t('movie.no_providers') }}</p>
        </div>

        <div v-else class="providers">
          <section
            v-for="section in providerSections"
            :key="section.key"
            class="providers__category"
          >
            <h3>{{ t(section.label) }}</h3>
            <div class="providers__grid">
              <div
                v-for="provider in section.providers"
                :key="provider.id"
                class="provider__card"
              >
                <img
                  v-if="provider.logo_path"
                  :src="getProviderImageUrl(provider.logo_path)"
                  :alt="provider.name"
                  class="provider__logo"
                />
                <span class="provider__name">{{ provider.name }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { generateMovieSchema } from '@/lib/seo'
import { useSeo } from '@/composables/useSeo'
import { useWatchProviders } from '@/composables/useWatchProviders'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Chip from '@/components/Chip.vue'
import AdSenseAd from '@/components/ads/AdSenseAd.vue'
import { getMovieByUuid, getTmdbImageUrl, type MovieDetail } from '@/services/movie.service'

const { t } = useI18n()
const route = useRoute()

// Composable para watch providers
const {
  providers,
  isLoading: isLoadingProviders,
  hasProviders,
  providerSections,
  loadedMovieId,
  loadProviders,
} = useWatchProviders()

// Route uses :slug param containing backend ID in format: {id}-{title-slugified}
// ID can be UUID (9f5dde6b-...) or TMDB ID (550)
// Extract the ID (first segment before first hyphen)
const movieId = computed(() => {
  const slug = String(route.params.slug || '')

  // Try UUID pattern first (8-4-4-4-12 hex chars)
  const uuidMatch = slug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
  if (uuidMatch) {
    return uuidMatch[1]
  }

  // Fallback: get first segment before any hyphen (works for both UUID and numeric IDs)
  const parts = slug.split('-')
  return parts[0] || ''
})

const movie = ref<MovieDetail | null>(null)
const isLoading = ref(true)
const showWatchModal = ref(false)
const error = ref<number | string | null>(null)

// providers, isLoadingProviders, loadedMovieId já vêm do composable

const breadcrumbItems = computed(() => [
  { label: t('common.home'), to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: movie.value?.title || movieId.value },
])

const canonicalUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://watchnext.app'
  return `${baseUrl}/movies/${movieId.value}`
})

const posterUrl = computed(() => {
  return getTmdbImageUrl(movie.value?.poster_path, 'w500')
})

const backdropUrl = computed(() => {
  return getTmdbImageUrl(movie.value?.backdrop_path, 'original')
})

const releaseYear = computed(() => {
  if (!movie.value?.release_date) return ''
  return new Date(movie.value.release_date).getFullYear().toString()
})

// hasProviders vem do composable useWatchProviders

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatMoney(amount: number | null): string {
  if (!amount) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getProviderImageUrl(logoPath: string | null): string | undefined {
  return getTmdbImageUrl(logoPath, 'w92')
}

// Load movie data and watch providers in parallel
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    const id = movieId.value
    if (!id) {
      throw new Error('Invalid movie ID')
    }

    // Load movie details and watch providers in parallel
    await Promise.all([
      (async () => {
        movie.value = await getMovieByUuid(id)
      })(),
      (async () => {
        await loadProviders(id)
      })(),
    ])
  } catch (err: any) {
    error.value = err?.response?.status === 404 ? 404 : 'unknown'
    movie.value = null
  } finally {
    isLoading.value = false
  }
})

// Fallback: carrega providers apenas se necessário (não foi carregado no onMounted)
watchEffect(() => {
  const currentMovieId = movie.value?.id
  // Só carrega se: modal aberto, não carregado para este movie, e não está carregando
  if (showWatchModal.value && currentMovieId && loadedMovieId.value !== currentMovieId && !isLoadingProviders.value) {
    loadProviders(currentMovieId)
  }
})

// Setup SEO
const seoTitle = computed(() => movie.value ? `${movie.value.title} | SeeUs` : 'Movies | SeeUs')
const seoDescription = computed(() => movie.value?.overview || 'Discover our curated collection of films')
const seoImage = computed(() => getTmdbImageUrl(movie.value?.poster_path))
const ogType = computed(() => 'video.movie')

// Movie JSON-LD structured data
const movieJsonLd = computed(() => {
  if (!movie.value) return {}
  return generateMovieSchema({
    title: movie.value.title,
    description: movie.value.overview || '',
    cover: getTmdbImageUrl(movie.value.poster_path),
    releaseYear: releaseYear.value,
    duration: movie.value.runtime_minutes || 0,
    rating: movie.value.vote_average?.toString() || '',
    tags: movie.value.genres?.map(g => g.name) || [],
    slug: movieId.value,
  } as any)
})

useSeo({
  title: seoTitle,
  description: seoDescription,
  url: canonicalUrl,
  image: seoImage,
  type: ogType,
  jsonLd: movieJsonLd,
})
</script>

<style lang="scss" scoped>
.movie-page {
  padding: 2rem 0 4rem;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__loading {
    padding: 4rem 0;
    text-align: center;
    color: var(--text-secondary);
  }

  &__header {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    margin-bottom: 3rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  &__media {
    position: relative;
  }

  &__backdrop {
    margin-top: 1.5rem;
    border-radius: 8px;
    overflow: hidden;

    &-img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  &__poster {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    &-img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      display: block;
    }

    &-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      font-size: 3rem;

      span {
        font-size: 4rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.875rem;
        margin: 0;
      }
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  &__original-title {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0;

    .label {
      font-weight: 600;
      color: var(--text-tertiary);
    }
  }

  &__tagline {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;

    span {
      font-size: 0.875rem;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
    }
  }

  &__ratings {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;

    &__stars {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    &__icon {
      font-size: 1.25rem;
    }

    &__value {
      font-size: 1.25rem;
    }

    &__max {
      color: var(--text-secondary);
    }

    &__count {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  }

  &__genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  &__synopsis {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);

    &__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
    }

    &__content {
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    &__empty {
      color: var(--text-tertiary);
      font-style: italic;
    }
  }

  &__financial {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);

    &__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    &__item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    &__label {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    &__value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  &__homepage {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--brand-primary);
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-top: 1rem;

    &:hover {
      background: var(--brand-primary-hover, var(--brand-primary));
      transform: translateY(-2px);
    }

    .external-link-icon {
      font-size: 1rem;
    }
  }

  &__actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      flex-direction: column;
    }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9375rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &--homepage {
      background: var(--brand-primary);
      color: white;

      &:hover {
        background: var(--brand-primary-hover, var(--brand-primary));
        transform: translateY(-2px);
      }

      .external-link-icon {
        font-size: 1rem;
      }
    }

    &--watch {
      flex: 1;
      min-width: 200px;
      background: var(--brand-accent);
      color: white;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb), 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__loading {
    padding: 4rem 0;
    text-align: center;
    color: var(--text-secondary);
  }

  &__error {
    padding: 4rem 0;
    text-align: center;
    color: var(--text-error, #ef4444);
  }

  &__skeleton {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    &-poster {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
      background-size: 200% 100%;
      border-radius: 8px;
      animation: shimmer 1.5s infinite;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    &-title {
      height: 3rem;
      background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 1.5s infinite;
    }

    &-meta {
      height: 1.5rem;
      background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 1.5s infinite;
    }

    &-overview {
      height: 6rem;
      background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 1.5s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-primary);
    }
  }

  &__close {
    background: transparent;
    border: none;
    font-size: 2rem;
    color: var(--text-secondary);
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  }

  &__content {
    padding: 2rem;
  }
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__category {
    h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      color: var(--text-primary);
      font-weight: 600;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }
}

.provider {
  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-tertiary);
      transform: translateY(-2px);
    }
  }

  &__logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  &__name {
    font-size: 0.85rem;
    color: var(--text-primary);
    text-align: center;
    font-weight: 500;
    line-height: 1.3;
  }
}
</style>