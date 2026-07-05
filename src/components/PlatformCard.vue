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
    <a
      v-if="downloadUrl"
      :href="downloadUrl"
      class="platform-card__btn btn-hover"
      :class="`platform-card__btn--${id}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ buttonLabel }}
    </a>
    <button
      v-else
      class="platform-card__btn btn-hover"
      :class="`platform-card__btn--${id}`"
      disabled
    >
      {{ comingSoonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { loadDownloadConfig } from '@/services/downloads'

const { t } = useI18n()

const props = defineProps<{
  id: string
  name: string
  description: string
  staggerIndex?: number
}>()

const { el: cardRef } = useScrollReveal()
const downloadUrl = ref<string | null>(null)

onMounted(async () => {
  const config = await loadDownloadConfig()
  const platformKey = props.id.toLowerCase() as keyof typeof config
  downloadUrl.value = config[platformKey] || null

  if (props.staggerIndex !== undefined && cardRef.value) {
    (cardRef.value as HTMLElement).style.animationDelay = `${props.staggerIndex * 80}ms`
  }
})

s

const iconSrc = computed(() => {
  return `/assets/icons/${props.id.toLowerCase()}.png`
})

const buttonLabel = computed(() => {
  const map: Record<string, string> = {
    web: 'platforms.buttons.web',
    windows: 'platforms.buttons.windows',
    android: 'platforms.buttons.android',
    macos: 'platforms.buttons.macos',
  }
  const key = map[props.id]
  return key ? t(key) : t('platforms.buttons.comingSoon')
})
const comingSoonLabel = computed(() => t('platforms.buttons.comingSoon'))
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