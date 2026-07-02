<template>
  <div ref="itemRef" class="timeline-item reveal">
    <div class="timeline-item__marker">
      <span class="timeline-item__dot" :class="`timeline-item__dot--${status}`"></span>
      <div class="timeline-item__line"></div>
    </div>
    <div class="timeline-item__content">
      <span class="timeline-item__quarter" :class="`timeline-item__quarter--${status}`">
        {{ quarter }}
      </span>
      <h3 class="timeline-item__title">{{ title }}</h3>
      <p class="timeline-item__description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const props = defineProps<{
  quarter: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  staggerIndex?: number
}>()

const { el: itemRef } = useScrollReveal()

onMounted(() => {
  if (props.staggerIndex !== undefined && itemRef.value) {
    itemRef.value.style.animationDelay = `${props.staggerIndex * 100}ms`
  }
})
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.timeline-item {
  display: flex;
  gap: $space-6;
  padding: $space-4;
  border-radius: $radius-lg;
  transition: transform $transition-base, box-shadow $transition-base;
  will-change: transform, box-shadow;

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }

  &__marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 20px;
  }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: $radius-full;
    flex-shrink: 0;
    margin-top: 5px;
    transition: box-shadow $transition-base;

    &--completed {
      background-color: $color-success;
      box-shadow: 0 0 8px $color-success-glow;
    }

    &--in-progress {
      background-color: $color-accent;
      box-shadow: 0 0 8px $color-accent-glow;
    }

    &--planned {
      background-color: $color-text-muted;
    }
  }

  &__line {
    width: 1px;
    flex: 1;
    background: $color-border;
    margin-top: $space-2;
  }

  &:hover &__dot {
    &--completed {
      box-shadow: 0 0 16px rgba($color-success, 0.5);
    }
    &--in-progress {
      box-shadow: 0 0 16px rgba($color-accent, 0.5);
    }
  }

  &__content {
    padding-bottom: $space-8;
  }

  &__quarter {
    display: inline-block;
    padding: $space-1 $space-3;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    border-radius: $radius-full;
    margin-bottom: $space-3;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;

    &--completed {
      background: rgba($color-success, 0.15);
      color: $color-success;
    }

    &--in-progress {
      background: rgba($color-accent, 0.15);
      color: $color-accent;
    }

    &--planned {
      background: $color-surface-light;
      color: $color-text-secondary;
    }
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text;
    margin-bottom: $space-2;
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
  }
}
</style>