import type { BlogPost } from '../types/BlogPost'

export interface BlogProvider {
  getPosts(): Promise<BlogPost[]>
  getPost(slug: string): Promise<BlogPost | null>
}