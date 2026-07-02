import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  const el = ref<Element | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).classList.add('revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    if (el.value) observer.observe(el.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { el }
}