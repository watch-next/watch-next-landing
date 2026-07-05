import { watch, type MaybeRef } from 'vue'

export interface SeoOptions {
  title: MaybeRef<string>
  description: MaybeRef<string>
  canonical?: MaybeRef<string>
  ogImage?: MaybeRef<string>
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
}

export function useSeo(options: SeoOptions) {
  const updateMetaTags = (seo: SeoOptions) => {
    // Title
    document.title = typeof seo.title === 'string' ? seo.title : seo.title.value

    // Description
    updateOrCreateMeta('description', typeof seo.description === 'string' ? seo.description : seo.description.value)

    // Canonical
    const canonicalUrl = seo.canonical
      ? typeof seo.canonical === 'string'
        ? seo.canonical
        : seo.canonical.value
      : window.location.href

    updateOrCreateLink('canonical', canonicalUrl)

    // Open Graph
    updateOrCreateMeta('og:title', typeof seo.title === 'string' ? seo.title : seo.title.value)
    updateOrCreateMeta('og:description', typeof seo.description === 'string' ? seo.description : seo.description.value)
    updateOrCreateMeta('og:type', 'website')
    updateOrCreateMeta('og:url', canonicalUrl)

    if (seo.ogImage) {
      const ogImage = typeof seo.ogImage === 'string' ? seo.ogImage : seo.ogImage.value
      updateOrCreateMeta('og:image', ogImage)
      updateOrCreateMeta('og:image:alt', 'Watch Next - Legal Page')
    }

    // Twitter Card
    const twitterCard = seo.twitterCard || 'summary_large_image'
    updateOrCreateMeta('twitter:card', twitterCard)
    updateOrCreateMeta('twitter:title', typeof seo.title === 'string' ? seo.title : seo.title.value)
    updateOrCreateMeta('twitter:description', typeof seo.description === 'string' ? seo.description : seo.description.value)

    if (seo.ogImage) {
      const twitterImage = typeof seo.ogImage === 'string' ? seo.ogImage : seo.ogImage.value
      updateOrCreateMeta('twitter:image', twitterImage)
    }
  }

  const updateOrCreateMeta = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.querySelector(`meta[property="${name}"]`)
    }
    if (!meta) {
      meta = document.createElement('meta')
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        meta.setAttribute('property', name)
      } else {
        meta.setAttribute('name', name)
      }
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  const updateOrCreateLink = (rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', rel)
      document.head.appendChild(link)
    }
    link.href = href
  }

  // Initial update
  updateMetaTags(options)

  // Watch for changes in reactive options
  watch(
    () => ({
      title: typeof options.title === 'string' ? options.title : options.title.value,
      description: typeof options.description === 'string' ? options.description : options.description.value,
      canonical: options.canonical ? (typeof options.canonical === 'string' ? options.canonical : options.canonical.value) : undefined,
      ogImage: options.ogImage ? (typeof options.ogImage === 'string' ? options.ogImage : options.ogImage.value) : undefined,
      twitterCard: options.twitterCard,
    }),
    (newOptions) => {
      updateMetaTags({
        title: newOptions.title,
        description: newOptions.description,
        canonical: newOptions.canonical,
        ogImage: newOptions.ogImage,
        twitterCard: newOptions.twitterCard,
      })
    },
    { immediate: true }
  )
}