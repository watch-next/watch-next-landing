/**
 * Convert a string to a URL-safe slug.
 * Handles special characters, spaces, and diacritics.
 *
 * @example
 * slugify('The Dark Knight') // 'the-dark-knight'
 * slugify('Amélie') // 'amelie'
 * slugify('The Matrix (1999)') // 'the-matrix-1999'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    // Remove diacritics (accents, umlauts, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
}

/**
 * Convert a slug back to a readable title.
 * Useful for displaying content titles from URLs.
 *
 * @example
 * unslugify('the-dark-knight') // 'The Dark Knight'
 * unslugify('amelie') // 'Amelie'
 * unslugify('the-matrix-1999') // 'The Matrix 1999'
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Extract year from a date string or number.
 * Used for validating release years.
 */
export function parseYear(year: string | number): number {
  const num = typeof year === 'string' ? parseInt(year, 10) : year
  if (isNaN(num) || num < 1800 || num > new Date().getFullYear() + 5) {
    throw new Error(`Invalid year: ${year}`)
  }
  return num
}

/**
 * Validate that a slug matches the expected format.
 * Slugs should be lowercase, alphanumeric with hyphens.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

/**
 * Generate a slug from a title, ensuring uniqueness.
 * @param title - The source title
 * @param existingSlugs - Set of slugs that already exist
 * @returns A unique slug
 */
export function generateUniqueSlug(title: string, existingSlugs: Set<string>): string {
  let baseSlug = slugify(title)
  let counter = 1
  let slug = baseSlug

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}