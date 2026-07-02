<template>
  <div ref="cardRef" class="feature-card card-hover reveal-scale">
    <div class="feature-card__icon">
      <img
        class="feature-card__icon-img"
        :src="iconSrc"
        :alt="`${title} icon`"
        loading="lazy"
        width="48"
        height="48"
      />
    </div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{
  title: string
  description: string
  icon: string
}>()

const { el: cardRef } = useScrollReveal()

const iconSrc = computed(() => {
  const map: Record<string, string> = {
    discover: 'discover',
    track: 'track',
    social: 'social',
    calendar: 'calendar',
    rating: 'rating',
    offline: 'offline',
  }
  const name = map[props.icon]
  return new URL(`../assets/icons/${name}.svg`, import.meta.url).href
})
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.feature-card.card-hover {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-6;
  background: $gradient-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  transition: all $transition-base;

  &:hover {
    border-color: $color-border-hover;
    background: $gradient-card-hover;
    transform: translateY(-4px);
    box-shadow: $shadow-card-hover;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    background: $gradient-card;
    border: 1px solid $color-border;
  }

  &__icon-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text;
    margin-top: $space-2;
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
  }
}
</style>