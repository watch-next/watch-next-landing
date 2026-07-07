import type { BlogPost } from '../types/BlogPost'

export interface SearchIndex {
  slug: string
  searchText: string
}

export function buildSearchIndex(posts: BlogPost[]): SearchIndex[] {
  return posts.map(post => ({
    slug: post.slug,
    searchText: (
      post.title + ' ' +
      post.description + ' ' +
      post.category + ' ' +
      post.tags.join(' ') + ' ' +
      post.content
    ).toLowerCase()
  }))
}

export function searchPosts(query: string, index: SearchIndex[]): string[] {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return []

  return index
    .filter(item => item.searchText.includes(normalizedQuery))
    .map(item => item.slug)
}