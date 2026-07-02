<template>
  <section id="features" class="features">
    <div class="container">
      <div ref="sectionRef" class="features__header reveal">
        <h2 class="features__title">{{ featuresSection.title }}</h2>
        <p class="features__subtitle">{{ featuresSection.subtitle }}</p>
      </div>
      <div class="features__grid">
        <FeatureCard
          v-for="(feature, index) in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
          :stagger-index="index"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FeatureCard from '@/components/FeatureCard.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { t } = useI18n()

const featuresSection = {
  title: t('features.title'),
  subtitle: t('features.subtitle'),
}

const features = [
  {
    title: t('features.items.discovery.title'),
    description: t('features.items.discovery.description'),
    icon: 'discover',
  },
  {
    title: t('features.items.tracking.title'),
    description: t('features.items.tracking.description'),
    icon: 'track',
  },
  {
    title: t('features.items.social.title'),
    description: t('features.items.social.description'),
    icon: 'social',
  },
  {
    title: t('features.items.calendar.title'),
    description: t('features.items.calendar.description'),
    icon: 'calendar',
  },
  {
    title: t('features.items.ratings.title'),
    description: t('features.items.ratings.description'),
    icon: 'rating',
  },
  {
    title: t('features.items.offline.title'),
    description: t('features.items.offline.description'),
    icon: 'offline',
  },
]

const { el: sectionRef } = useScrollReveal()
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.features {
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
  }

  @media (max-width: 992px) {
    &__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 1023px) {
    &__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 639px) {
    padding-block: $space-16;

    &__title {
      font-size: $text-3xl;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>