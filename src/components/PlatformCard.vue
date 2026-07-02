<template>
  <div ref="cardRef" class="platform-card card-hover reveal-scale">
    <div class="platform-card__badge">
      <img
        class="platform-card__icon"
        :src="iconSrc"
        :alt="`${name} icon`"
        loading="lazy"
        width="48"
        height="48"
      />
    </div>
    <h3 class="platform-card__name">{{ name }}</h3>
    <p class="platform-card__description">{{ description }}</p>
    <button class="platform-card__btn btn-hover" :class="`platform-card__btn--${id}`">
      {{ buttonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{
  id: string
  name: string
  description: string
}>()

const { el: cardRef } = useScrollReveal()

const iconSrc = computed(() => {
  return new URL(`../assets/icons/${props.id}.svg`, import.meta.url).href
})
const buttonLabel = computed(() => {
  const map: Record<string, string> = {
    web: 'Open in Browser',
    windows: 'Download for Windows',
    android: 'Get it on Google Play',
  }
  return map[props.id] || 'Download'
})
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '@/style/variables' as *;

.platform-card.card-hover {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  padding: $space-8 $space-6;
  background: $gradient-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  transition: all $transition-base;

  &:hover {
    border-color: $color-border-hover;
    transform: translateY(-4px);
    box-shadow: $shadow-card-hover;
  }

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: $radius-full;
    background: $gradient-card;
    border: 1px solid $color-border;
  }

  &__icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  &__name {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $color-text;
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
    max-width: 260px;
  }

  &__btn {
    margin-top: $space-2;
    padding: $space-2 $space-4;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    color: $color-text;
    border-radius: $radius-full;
    transition: all $transition-base;

    &--web {
      background: $color-primary;

      &:hover {
        background: $color-primary-hover;
        box-shadow: $shadow-primary-glow;
      }
    }

    &--windows {
      background: $color-accent;

      &:hover {
        background: $color-accent-hover;
        box-shadow: $shadow-accent-glow;
      }
    }

    &--android {
      background: $color-success;

      &:hover {
        background: color.adjust($color-success, $lightness: -10%);
        box-shadow: $shadow-success-glow;
      }
    }
  }
}
</style>