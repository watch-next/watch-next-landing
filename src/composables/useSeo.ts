import { useHead } from '@unhead/vue'
import type { UseHeadOptions } from '@unhead/vue'
import type { ComputedRef, Ref } from 'vue'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export function useSeo(options: {
  title: MaybeRef<string>
  description: MaybeRef<string>
  image?: MaybeRef<string | undefined>
  type?: MaybeRef<string>
  url?: MaybeRef<string>
  jsonLd?: MaybeRef<Record<string, any> | undefined>
  openGraph?: MaybeRef<any>
  twitter?: MaybeRef<any>
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
      { name: 'twitter:image', content: options.image },
      { name: 'og:image', content: options.image },
      { name: 'og:image:alt', content: 'Watch Next' },
    )
  }

  if (options.url) {
    head.meta!.push({ name: 'og:url', content: options.url })
  }

  if (options.jsonLd) {
    head.script = [
      {
        type: 'application/ld+json',
        children: () => {
          const jsonLdValue = typeof options.jsonLd === 'function'
            ? options.jsonLd
            : 'value' in options.jsonLd
              ? options.jsonLd.value
              : options.jsonLd
          return JSON.stringify(jsonLdValue || {})
        },
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