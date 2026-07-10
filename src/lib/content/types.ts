export interface ContentItem {
  /** Unique identifier (slug) */
  slug: string
  /** Display title */
  title: string
  /** Short description for meta tags and cards */
  description: string
  /** Primary cover/poster image URL */
  cover: string
  /** Full Markdown content */
  content: string
  /** Associated tags (e.g., genres for movies) */
  tags: string[]
  /** Content category (e.g., "Movie", "Series", "Person") */
  category: string
  /** ISO date string for sorting */
  date: string
  /** Last update date (optional) */
  updated?: string
  /** Featured content flag */
  featured?: boolean
  /** SEO title override */
  seoTitle?: string
  /** SEO description override */
  seoDescription?: string
  /** Open Graph image override */
  ogImage?: string
}

/**
 * Movie-specific content item.
 * Used for individual movie pages.
 */
export interface Movie extends ContentItem {
  streamingProviders?: StreamingProvider[];
  category: 'Movie'
  /** Release year */
  releaseYear: number
  /** Runtime in minutes */
  duration: number
  /** Average rating (0-10 scale) */
  rating?: number
  /** Streaming platform IDs where available */
  platforms?: string[]
  /** Director name(s) */
  directors?: string[]
  /** Cast member names */
  cast?: string[]
  /** Movie ID from external API (TMDB, etc.) */
  externalId?: string
}

/**
 * Series-specific content item.
 * Used for individual TV series pages.
 */
export interface Series extends ContentItem {
  category: 'Series'
  /** First air year */
  firstAirYear: number
  /** Last air year (or same as first if ongoing) */
  lastAirYear?: number
  /** Number of seasons */
  numberOfSeasons?: number
  /** Average rating (0-10 scale) */
  rating?: number
  /** Streaming platform IDs where available */
  platforms?: string[]
  /** Series status */
  status?: 'Ended' | 'Returning Series' | 'In Production'
  /** Series ID from external API (TMDB, etc.) */
  externalId?: string
}

/**
 * Person content item for actors and directors.
 * Used for biographical pages.
 */
export interface Person extends ContentItem {
  category: 'Actor' | 'Director'
  /** Birth date (YYYY-MM-DD format) */
  birthDate?: string
  /** Birth place */
  birthPlace?: string
  /** Death date (if applicable) */
  deathDate?: string
  /** Array of related content slugs (filmography) */
  filmography?: string[]
  /** Primary profession */
  profession: string
  /** Person ID from external API */
  externalId?: string
}

/**
 * Genre page content item.
 * Used for curated genre landing pages.
 */
export interface Genre extends ContentItem {
  category: 'Genre'
  /** Array of movie slugs in this genre */
  movies?: string[]
  /** Array of series slugs in this genre */
  series?: string[]
}

/**
 * Collection content item.
 * Used for themed lists (e.g., "Best Sci-Fi Movies").
 */
export interface Collection extends ContentItem {
  category: 'Collection'
  /** Array of content slugs in the collection */
  items: string[]
  /** Collection type for filtering */
  collectionType: 'movies' | 'series' | 'mixed'
}

/**
 * Union type for all content types.
 * Useful for content provider return types.
 */
export type ContentType = Movie | Series | Person | Genre | Collection

/**
 * Type guard to check if content is a Movie.
 */
export function isMovie(content: ContentType): content is Movie {
  return content.category === 'Movie'
}

/**
 * Type guard to check if content is a Series.
 */
export function isSeries(content: ContentType): content is Series {
  return content.category === 'Series'
}

/**
 * Type guard to check if content is a Person.
 */
export function isPerson(content: ContentType): content is Person {
  return content.category === 'Actor' || content.category === 'Director'
}

/**
 * Type guard to check if content is an Actor.
 */
export function isActor(content: ContentType): content is Person {
  return content.category === 'Actor'
}

/**
 * Type guard to check if content is a Director.
 */
export function isDirector(content: ContentType): content is Person {
  return content.category === 'Director'
}

/**
 * Type guard to check if content is a Genre.
 */
export function isGenre(content: ContentType): content is Genre {
  return content.category === 'Genre'
}

/**
 * Type guard to check if content is a Collection.
 */
export function isCollection(content: ContentType): content is Collection {
  return content.category === 'Collection'
}