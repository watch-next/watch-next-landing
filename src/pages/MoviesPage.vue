<template>
  <div class="movies-page">
    <div class="container">
      <!-- Header -->
      <header class="movies-page__header">
        <nav class="movies-page__breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb__item">
              <router-link to="/" class="breadcrumb__link">
                {{ t('common.home') }}
              </router-link>
            </li>
            <li class="breadcrumb__item" aria-current="page">
              <span class="breadcrumb__current">Movies</span>
            </li>
          </ol>
        </nav>

        <h1 class="movies-page__title">Movies</h1>
        <p class="movies-page__subtitle">
          Discover our curated collection of films
        </p>
      </header>

      <!-- AdSense Banner -->
      <AdSenseAd
        format="auto"
        layout="fixed"
        responsive
        class="movies-page__ad"
      />

      <!-- Loading State -->
      <div v-if="loading" class="movies-page__empty">
        <p>{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="movies-page__empty">
        <p>Unable to load movies. Please try again later.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="movies.length === 0" class="movies-page__empty">
        <p>No movies available yet. Check back soon!</p>
      </div>

      <!-- Movies Grid -->
      <div v-else class="movies-page__grid">
        <router-link
          v-for="movie in movies"
          :key="movie.slug"
          :to="`/movies/${movie.slug}`"
          class="movie-card"
        >
          <div class="movie-card__poster-wrapper">
            <img
              :src="movie.cover"
              :alt="movie.title"
              class="movie-card__poster"
              loading="lazy"
            />
            <div v-if="movie.rating" class="movie-card__rating">
              ★ {{ movie.rating }}
            </div>
          </div>
          <div class="movie-card__content">
            <h2 class="movie-card__title">{{ movie.title }}</h2>
            <p class="movie-card__meta">
              <span class="movie-card__year">{{ movie.releaseYear }}</span>
              <span v-if="movie.duration" class="movie-card__duration">
                {{ formatDuration(movie.duration) }}
              </span>
            </p>
    <!--        <p class="movie-card__description">{{ movie.description }}</p>
            <div v-if="movie.tags && movie.tags.length" class="movie-card__tags">
              <span
                v-for="tag in movie.tags.slice(0, 3)"
                :key="tag"
                class="movie-card__tag"
              >
                {{ tag }}
              </span>
            </div>-->
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMovies } from '@/lib/content/MovieRepository'
import type { Movie } from '@/lib/content/types'
import { useSeo } from '@/composables/useSeo'
import AdSenseAd from '@/components/ads/AdSenseAd.vue'

const { t } = useI18n()

const movies = ref<Movie[]>([])
const loading = ref(true)
const error = ref(false)

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Load movies
onMounted(async () => {
  try {
    loading.value = true
    error.value = false
    movies.value = await getMovies()
  } catch (err) {
    error.value = true
    movies.value = []
  } finally {
    loading.value = false
  }
})

// SEO
// SEO setup (run during component setup, before async operations)
useSeo({
  title: 'Movies | Watch Next',
  description: 'Discover our curated collection of films',
  type: 'website',
})
</script>

<style lang="scss" scoped>
.movies-page {
  padding: 2rem 0 4rem;

  &__header {
    margin-bottom: 3rem;
  }

  &__breadcrumb {
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  &__subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  &__empty {
    text-align: center;
    padding: 4rem 0;
    color: var(--text-secondary);
  }
}

.movie-card {
  display: block;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  &__poster-wrapper {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--bg-tertiary);
  }

  &__poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover &__poster {
    transform: scale(1.05);
  }

  &__rating {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(0, 0, 0, 0.8);
    color: var(--accent);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__content {
    padding: 1.25rem;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  &__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  &__year,
  &__duration {
    font-weight: 500;
  }

  &__description {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0 0 0.75rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__tag {
    padding: 0.25rem 0.625rem;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
}

// Breadcrumb styles (inline, matching blog pattern)
.breadcrumb {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  &__link {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--text-primary);
    }

    &--current {
      color: var(--text-primary);
      font-weight: 500;
      cursor: default;

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  &__separator {
    color: var(--text-secondary);
    opacity: 0.6;
  }
}
</style>