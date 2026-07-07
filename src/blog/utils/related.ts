import type { BlogPost } from '../types/BlogPost'

export function findRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] {
  const related = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      let score = 0

      if (post.category === currentPost.category) {
        score += 2
      }

      const sharedTags = post.tags.filter(tag =>
        currentPost.tags.includes(tag)
      )
      score += sharedTags.length

      return { post, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)

  if (related.length < limit) {
    const remaining = allPosts
      .filter(post => post.slug !== currentPost.slug && !related.includes(post))
      .slice(0, limit - related.length)
    related.push(...remaining)
  }

  return related
}