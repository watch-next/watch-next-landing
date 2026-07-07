export interface BlogPost {
  title: string
  slug: string
  description: string
  author: string
  date: string
  cover: string
  category: string
  tags: string[]
  content: string
  readingTime: number
  updated?: string
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
}