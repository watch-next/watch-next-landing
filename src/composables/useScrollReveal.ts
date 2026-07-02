import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(options?: {
  threshold?: number
  rootMargin?: string
  stagger?: boolean
  staggerDelay?: number
}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -40px 0px',
    stagger = false,
    staggerDelay = 80
  } = options || {}

  const el = ref<Element | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.classList.add('revealed')

            // Handle staggered children
            if (stagger) {
              const children = target.querySelectorAll('[data-stagger]')
              children.forEach((child, index) => {
                const delay = index * staggerDelay
                ;(child as HTMLElement).style.animationDelay = `${delay}ms`
                child.classList.add('stagger-visible')
              })
            }

            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    if (el.value) observer.observe(el.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { el }
}