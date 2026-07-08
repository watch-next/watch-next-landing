import type { Movie } from './types'

interface GlobModule {
  default: string
}

interface FrontmatterResult {
  frontmatter: Record<string, any>
  body: string
}

// Module-level glob - evaluated once at build time
const MOVIE_MODULES = import.meta.glob<GlobModule>('@/content/movies/*.md', { eager: true })

/**
 * StaticContentProvider loads Markdown content files from the filesystem.
 * Uses Vite's import.meta.glob for dynamic imports.
 *
 * Currently supports movies only. Future types can be added by extending
 * the glob pattern and type-specific parsing.
 */
export class StaticContentProvider {
  // Single cache for all movie data
  private moviesCache: Map<string, Movie> | null = null

  /**
   * Parse YAML frontmatter and body from Markdown content.
   */
  private parseMarkdown(markdown: string): FrontmatterResult {
    const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)

    if (!frontmatterMatch) {
      return { frontmatter: {}, body: markdown }
    }

    const [, frontmatterRaw, body] = frontmatterMatch
    const frontmatter: Record<string, any> = {}

    // Parse YAML-like frontmatter (simple parser for basic values)
    const lines = frontmatterRaw.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1 || line.trim().startsWith('#')) continue

      const key = line.slice(0, colonIndex).trim()
      let value: string | string[] = line.slice(colonIndex + 1).trim()

      // Handle inline arrays (e.g., tags: [Sci-Fi, Drama])
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''))
      }

      // Handle multi-line arrays (e.g., cast:\n  - Item 1\n  - Item 2)
      if (['cast', 'directors', 'tags', 'genres'].includes(key)) {
        const arrayLines: string[] = []
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          if (nextLine.match(/^\s*-\s+/)) {
            arrayLines.push(nextLine.replace(/^\s*-\s+/, '').trim())
          } else if (nextLine.trim() && !nextLine.startsWith(' ')) {
            break
          } else if (nextLine.trim() === '') {
            continue
          } else {
            break
          }
        }
        if (arrayLines.length > 0) {
          value = arrayLines
        }
      }

      // Type conversion
      if (['releaseYear', 'duration', 'rating', 'numberOfSeasons'].includes(key)) {
        frontmatter[key] = Array.isArray(value) ? null : (value ? Number(value) : null)
      } else if (['featured', 'isAdult'].includes(key)) {
        frontmatter[key] = (typeof value === 'string') && value === 'true'
      } else {
        frontmatter[key] = value
      }
    }

    return { frontmatter, body: body.trim() }
  }

  /**
   * Find module path by matching slug against available keys.
   * Uses robust path matching instead of reconstructing paths.
   */
  private findModulePath(slug: string): string | null {
    const targetSuffix = `/${slug}.md`
    for (const path of Object.keys(MOVIE_MODULES)) {
      if (path.endsWith(targetSuffix)) {
        return path
      }
    }
    return null
  }

  /**
   * Load movie metadata from Markdown frontmatter.
   */
  private async loadMovieFromMarkdown(slug: string): Promise<Movie | null> {
    try {
      const modulePath = this.findModulePath(slug)

      if (!modulePath) {
        console.warn(`Movie module not found for slug: ${slug}`)
        return null
      }

      const module = MOVIE_MODULES[modulePath]

      const { frontmatter, body } = this.parseMarkdown(module.default)

      return {
        slug,
        title: frontmatter.title || slug,
        description: frontmatter.description || '',
        cover: frontmatter.cover || '/og/default.png',
        content: body,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category: 'Movie',
        date: frontmatter.releaseYear?.toString() || new Date().toISOString(),
        releaseYear: frontmatter.releaseYear || new Date().getFullYear(),
        duration: frontmatter.duration || 0,
        rating: frontmatter.rating,
        directors: Array.isArray(frontmatter.directors) ? frontmatter.directors : [],
        cast: Array.isArray(frontmatter.cast) ? frontmatter.cast : [],
        featured: frontmatter.featured || false,
        seoTitle: frontmatter.seoTitle,
        seoDescription: frontmatter.seoDescription,
        ogImage: frontmatter.ogImage,
      }
    } catch (error) {
      console.error(`Error loading movie ${slug}:`, error)
      return null
    }
  }

  /**
   * Get a single movie by slug.
   */
  async getMovie(slug: string): Promise<Movie | null> {
    return this.loadMovieFromMarkdown(slug)
  }

  /**
   * Parse and load movie from module and slug.
   */
  private parseMovieFromModule(module: GlobModule, slug: string): Movie {
    const { frontmatter, body } = this.parseMarkdown(module.default)

    return {
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      cover: frontmatter.cover || '/og/default.png',
      content: body,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      category: 'Movie',
      date: frontmatter.releaseYear?.toString() || new Date().toISOString(),
      releaseYear: frontmatter.releaseYear || new Date().getFullYear(),
      duration: frontmatter.duration || 0,
      rating: frontmatter.rating,
      directors: Array.isArray(frontmatter.directors) ? frontmatter.directors : [],
      cast: Array.isArray(frontmatter.cast) ? frontmatter.cast : [],
      featured: frontmatter.featured || false,
      seoTitle: frontmatter.seoTitle,
      seoDescription: frontmatter.seoDescription,
      ogImage: frontmatter.ogImage,
    }
  }

  /**
   * Get all movies.
   */
  async getMovies(): Promise<Movie[]> {
    if (this.moviesCache) {
      return Array.from(this.moviesCache.values())
    }

    try {
      const movies: Movie[] = []

      for (const [path, module] of Object.entries(MOVIE_MODULES)) {
        const slug = path.split('/').pop()?.replace('.md', '') || ''
        try {
          const movie = this.parseMovieFromModule(module, slug)
          movies.push(movie)
        } catch (error) {
          console.error(`Error parsing movie ${slug}:`, error)
        }
      }

      // Sort by release year (newest first)
      movies.sort((a, b) => b.releaseYear - a.releaseYear)

      this.moviesCache = new Map(movies.map(m => [m.slug, m]))
      return movies
    } catch (error) {
      console.error('Error loading movies:', error)
      return []
    }
  }

  /**
   * Clear the cache (useful for development).
   */
  clearCache(): void {
    this.moviesCache = null
  }
}