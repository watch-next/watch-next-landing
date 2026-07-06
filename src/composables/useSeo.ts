import { useHead } from '@vueuse/head'
import type { UseHeadOptions } from '@vueuse/head'

export function useSeo(options: {
  title: string
  description: string
  image?: string
  type?: string
  url?: string
  jsonLd?: Record<string, any>
}) {
  const head: UseHeadOptions = {
    title: options.title,
    meta: [
      { name: 'description', content: options.description },
      { name: 'twitter:title', content: options.title },
      { name: 'twitter:description', content: options.description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'og:title', content: options.title },
      { name: 'og:description', content: options.description },
      { name: 'og:type', content: options.type ?? 'website' },
      { name: 'og:locale', content: 'en_US' },
    ],
  }

  if (options.image) {
    head.meta!.push(
      { name: 'twitter:image', content: options.image! },
      { name: 'og:image', content: options.image! },
      { name: 'og:image:alt', content: 'Watch Next' },
    )
  }

  if (options.url) {
    head.meta!.push({ name: 'og:url', content: options.url! })
  }

  if (options.jsonLd) {
    head.script = [
      {
        type: 'application/ld+json',
        children: JSON.stringify(options.jsonLd),
      },
    ]
  }

  useHead(head)
}

/**
 * Inject FAQ structured data (FAQPage schema) for SEO
 * This function adds the JSON-LD script to the page head
 */
export function useFaqJsonLd(faqItems: Array<{ question: string; answer: string }>) {
  if (!faqItems || faqItems.length === 0) {
    return
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd),
      },
    ],
  })
}