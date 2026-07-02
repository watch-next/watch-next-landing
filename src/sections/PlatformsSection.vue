<template>
  <section id="platforms" class="platforms">
    <div class="container">
      <div ref="sectionRef" class="platforms__header reveal">
        <h2 class="platforms__title">{{ platformsSection.title }}</h2>
        <p class="platforms__subtitle">{{ platformsSection.subtitle }}</p>
      </div>
      <div class="platforms__grid">
        <PlatformCard
          v-for="platform in platforms"
          :key="platform.id"
          :id="platform.id"
          :name="platform.name"
          :description="platform.description"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import PlatformCard from '@/components/PlatformCard.vue'
import { platforms, platformsSection } from '@/data/platforms'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { el: sectionRef } = useScrollReveal()
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.platforms {
  padding-block: $space-20;

  &__header {
    text-align: center;
    margin-bottom: $space-12;
    max-width: 600px;
    margin-inline: auto;
  }

  &__title {
    font-size: $text-4xl;
    font-weight: $weight-extrabold;
    margin-bottom: $space-4;
  }

  &__subtitle {
    font-size: $text-lg;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-6;
    max-width: 960px;
    margin-inline: auto;
  }

  @media (max-width: 1023px) {
    &__grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 640px;
    }
  }

  @media (max-width: 639px) {
    padding-block: $space-16;

    &__title {
      font-size: $text-3xl;
    }

    &__grid {
      grid-template-columns: 1fr;
      max-width: 400px;
    }
  }
}
</style>