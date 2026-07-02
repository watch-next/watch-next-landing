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
import { computed, onMounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{
  title: string
  description: string
  icon: string
  staggerIndex?: number
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

onMounted(() => {
  if (props.staggerIndex !== undefined && cardRef.value) {
    (cardRef.value as HTMLElement).style.animationDelay = `${props.staggerIndex * 80}ms`
  }
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
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s ease;
  transform-style: preserve-3d;
  will-change: transform, box-shadow;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba($color-primary, 0.3), rgba($color-accent, 0.2));
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
    filter: blur(8px);
  }

  &:hover {
    transform: perspective(1000px) translateZ(20px) translateY(-8px);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 8px 24px rgba(62, 139, 255, 0.15),
      0 0 20px rgba($color-primary, 0.1);
    border-color: transparent;

    &::before {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: border-color 0.3s ease;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
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