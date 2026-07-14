<template>
  <article v-if="movie" class="movie-page">
    <div class="container movie-page__container">
      <!-- Breadcrumb -->
      <Breadcrumbs :items="breadcrumbItems" />

      <!-- Header -->
      <header class="movie-page__header">
        <div class="movie-page__poster">
          <img
            :src="movie.cover"
            :alt="movie.title"
            class="movie-page__poster-img"
            loading="lazy"
          />
        </div>

        <div class="movie-page__info">
          <h1 class="movie-page__title">{{ movie.title }}</h1>

          <div class="movie-page__meta">
            <span class="movie-page__year">{{ movie.releaseYear }}</span>
            <span class="movie-page__rating" v-if="movie.rating">
              ★ {{ movie.rating }}
            </span>
            <span class="movie-page__duration" v-if="movie.duration">
              {{ formatDuration(movie.duration) }}
            </span>
          </div>

          <div class="movie-page__genres" v-if="movie.tags && movie.tags.length">
            <span
              v-for="tag in movie.tags"
              :key="tag"
              class="movie-page__genre-chip"
            >
              {{ tag }}
            </span>
          </div>

          <p class="movie-page__description">{{ movie.description }}</p>

          <div class="movie-page__credits">
            <div class="movie-page__credit" v-if="movie.directors && movie.directors.length">
              <span class="movie-page__credit-label">{{ t('content.meta.director') }}:</span>
              <span class="movie-page__credit-value">{{ movie.directors.join(', ') }}</span>
            </div>
            <div class="movie-page__credit" v-if="movie.cast && movie.cast.length">
              <span class="movie-page__credit-label">{{ t('content.meta.cast') }}:</span>
              <span class="movie-page__credit-value">{{ movie.cast.join(', ') }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content - Movie Overview -->
      
    </div>
  </article>

  <div v-else class="container movie-page__loading">
    <p>{{ t('common.loading') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getMovieBySlug } from '@/lib/content/MovieRepository'
import { generateMovieSchema } from '@/lib/seo'
import { useSeo } from '@/composables/useSeo'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import type { Movie } from '@/lib/content/types'

const { t } = useI18n()
const route = useRoute()

const props = defineProps<{
  slug: string
}>()

const movie = ref<Movie | null>(null)

const breadcrumbItems = computed(() => [
  { label: t('common.home'), to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: movie.value?.title || props.slug },
])

const canonicalUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://watchnext.app'
  return `${baseUrl}/movies/${props.slug}`
})

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Load movie data
onMounted(async () => {
  console.log('[MoviePage] route.params:', route.params)
  console.log('[MoviePage] props.slug:', props.slug)
  movie.value = await getMovieBySlug(props.slug)
  console.log('[MoviePage] movie loaded:', movie.value?.slug, movie.value?.title)
})

// Setup SEO - reactive to movie data
const seoTitle = computed(() => movie.value ? `${movie.value.title} | Watch Next` : 'Movies | Watch Next')
const seoDescription = computed(() => movie.value?.seoDescription || movie.value?.description || 'Discover our curated collection of films')
const seoImage = computed(() => movie.value?.ogImage || movie.value?.cover)
const ogType = computed(() => movie.value ? 'video.movie' : 'website')

// Movie JSON-LD structured data
const movieJsonLd = computed(() => {
  if (!movie.value) return {}
  return generateMovieSchema(movie.value)
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

  &__poster {
    position: relative;

    &-img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

  &__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__year,
  &__rating,
  &__duration {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &__rating {
    color: var(--accent);
  }

  &__genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__genre-chip {
    padding: 0.35rem 0.75rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }

  &__credits {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  &__credit {
    display: flex;
    gap: 0.5rem;
  }

  &__credit-label {
    font-weight: 600;
    color: var(--text-primary);
  }

  &__credit-value {
    color: var(--text-secondary);
  }

  &__content {
    max-width: 800px;
    color: var(--text-primary);
    line-height: 1.7;

    :deep(h2) {
      font-size: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    :deep(h3) {
      font-size: 1.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    :deep(p) {
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }

    :deep(ul), :deep(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :deep(li) {
      margin-bottom: 0.5rem;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }

    :deep(th), :deep(td) {
      padding: 0.75rem;
      border: 1px solid var(--border);
      text-align: left;
    }

    :deep(th) {
      background: var(--bg-secondary);
      font-weight: 600;
    }
  }
}
</style>