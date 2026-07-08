/**
 * Content provider interface - mirrors BlogProvider pattern.
 * Ensures consistent API across blog and content pages.
 */
export interface ContentProvider {
  /** Get all content items */
  getContent(): Promise<import('./types').ContentType[]>
  /** Get a single item by slug */
  getBySlug(slug: string): Promise<import('./types').ContentType | undefined>
  /** Get items filtered by category */
  getByCategory(category: string): Promise<import('./types').ContentType[]>
  /** Get items filtered by tags */
  getByTags(tags: string[]): Promise<import('./types').ContentType[]>
}