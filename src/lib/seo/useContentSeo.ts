import type { Movie, Person, Series, ContentType } from '../content/types'
import { useSeo } from '../../composables/useSeo'

/**
 * Generate Movie schema.org JSON-LD structured data.
 * Used for SEO on individual movie pages.
 */
function generateMovieSchema(movie: Movie): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.description,
    image: movie.cover,
    datePublished: movie.releaseYear.toString(),
  }

  if (movie.duration) {
    schema.duration = `PT${movie.duration}M`
  }

  if (movie.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: movie.rating.toString(),
      bestRating: '10',
      worstRating: '1',
    }
  }

  if (movie.directors && movie.directors.length > 0) {
    schema.director = movie.directors.map(name => ({
      '@type': 'Person',
      name,
    }))
  }

  if (movie.cast && movie.cast.length > 0) {
    schema.actor = movie.cast.map(name => ({
      '@type': 'Person',
      name,
    }))
  }

  if (movie.tags && movie.tags.length > 0) {
    schema.genre = movie.tags
  }

  return schema
}

/**
 * Generate Series schema.org JSON-LD structured data.
 * Used for SEO on individual TV series pages.
 */
function generateSeriesSchema(series: Series): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: series.title,
    description: series.description,
    image: series.cover,
    datePublished: series.firstAirYear.toString(),
  }

  if (series.lastAirYear && series.lastAirYear !== series.firstAirYear) {
    schema.endDate = series.lastAirYear.toString()
  }

  if (series.numberOfSeasons) {
    schema.numberOfSeasons = series.numberOfSeasons.toString()
  }

  if (series.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: series.rating.toString(),
      bestRating: '10',
      worstRating: '1',
    }
  }

  if (series.tags && series.tags.length > 0) {
    schema.genre = series.tags
  }

  if (series.status) {
    schema.seriesStatus = series.status
  }

  return schema
}

/**
 * Generate Person schema.org JSON-LD structured data.
 * Used for SEO on actor and director pages.
 */
function generatePersonSchema(person: Person): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.title,
    description: person.description,
    image: person.cover,
    jobTitle: person.profession,
  }

  if (person.birthDate) {
    schema.birthDate = person.birthDate
  }

  if (person.birthPlace) {
    schema.birthPlace = {
      '@type': 'Place',
      name: person.birthPlace,
    }
  }

  if (person.deathDate) {
    schema.deathDate = person.deathDate
  }

  if (person.filmography && person.filmography.length > 0) {
    schema.knowsAbout = person.filmography
  }

  return schema
}

/**
 * Generate JSON-LD structured data for content items.
 * @param content - The content item
 * @returns JSON-LD schema object
 */
export function generateContentSchema(content: ContentType): Record<string, any> {
  if (content.category === 'Movie') {
    return generateMovieSchema(content as Movie)
  } else if (content.category === 'Series') {
    return generateSeriesSchema(content as Series)
  } else if (content.category === 'Actor' || content.category === 'Director') {
    return generatePersonSchema(content as Person)
  }
  return {}
}

export { generateMovieSchema, generateSeriesSchema, generatePersonSchema }

/**
 * SEO composable for content pages (movies, series, actors, directors).
 * Generates JSON-LD structured data and delegates to the base useSeo composable.
 *
 * @param content - The content item (Movie, Series, or Person)
 * @param baseUrl - Optional base URL for canonical URLs
 */
export function useContentSeo(content: Movie | Series | Person, baseUrl?: string) {
  const title = content.seoTitle ?? content.title
  const description = content.seoDescription ?? content.description

  const jsonLd = generateContentSchema(content)

  // Build canonical URL if baseUrl provided
  const url = baseUrl ? `${baseUrl}/movies/${content.slug}` : undefined

  // Use the base useSeo composable with content-specific data
  useSeo({
    title,
    description,
    image: content.ogImage ?? content.cover,
    type: content.category === 'Movie' ? 'video.movie' : content.category === 'Series' ? 'video.tv_series' : 'profile',
    url,
    jsonLd,
  })
}