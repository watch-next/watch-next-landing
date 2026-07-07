export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const plainText = content.replace(/<[^>]*>/g, '')
  const wordCount = plainText.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}