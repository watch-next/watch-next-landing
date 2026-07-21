<template>
  <div
    v-if="shouldRender"
    ref="adContainer"
    class="adsense-ad-container"
    :class="containerClass"
  >
    <!-- Desenvolvimento: Placeholder visual -->
    <div v-if="!isConfigured" class="adsense-placeholder">
      <span class="adsense-placeholder__label">Ad</span>
      <span class="adsense-placeholder__info">AdSense (não configurado)</span>
    </div>

    <!-- Produção: Inserir do AdSense -->
    <ins
      v-else
      class="adsbygoogle"
      :data-ad-client="adClient"
      :data-ad-slot="slot"
      :data-ad-format="format"
      :data-ad-layout="layout"
      :data-full-width-responsive="responsive ? 'true' : 'false'"
      style="display: block;"
    ></ins>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdSense } from '@/composables/useAdSense'
import type { AdSlotOptions } from '@/composables/useAdSense'

interface Props {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  layout?: 'in-article' | 'in-feed' | 'fixed'
  responsive?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'auto',
  layout: 'fixed',
  responsive: true,
  class: '',
  slot: undefined,
})

const adContainer = ref<HTMLElement | null>(null)
const { initialize, getConfigured } = useAdSense()

const isConfigured = computed(() => getConfigured())

const adClient = computed(() => {
  const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID
  return publisherId ? publisherId.replace('ca-pub-', '') : ''
})

const containerClass = computed(() => {
  const classes: string[] = []
  if (props.class) {
    classes.push(props.class)
  }
  if (props.responsive) {
    classes.push('adsense-ad-container--responsive')
  }
  return classes.join(' ')
})

const shouldRender = computed(() => {
  // Sempre renderizar, mesmo em dev (placeholder)
  return true
})

onMounted(async () => {
  if (isConfigured.value) {
    await initialize()
  }
})
</script>

<style lang="scss">
.adsense-ad-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  margin: 1.5rem 0;

  &--responsive {
    max-width: 100%;
  }

  // Evitar layout shift - reservar espaço mínimo
  ins.adsbygoogle {
    min-height: 50px;
    background: transparent;
  }
}

.adsense-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed var(--color-border, #e5e7eb);
  border-radius: 8px;
  background: var(--color-background-soft, #f9fafb);
  min-width: 200px;
  min-height: 100px;

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary, #6b7280);
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
  }

  &__info {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }
}
</style>