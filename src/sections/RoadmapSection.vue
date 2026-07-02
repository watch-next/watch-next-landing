<template>
  <section id="roadmap" class="roadmap">
    <div class="container">
      <div ref="sectionRef" class="roadmap__header reveal">
        <h2 class="roadmap__title">{{ roadmapSection.title }}</h2>
        <p class="roadmap__subtitle">{{ roadmapSection.subtitle }}</p>
      </div>
      <div class="roadmap__timeline">
        <TimelineItem
          v-for="(item, index) in roadmap"
          :key="index"
          :quarter="item.quarter"
          :title="item.title"
          :description="item.description"
          :status="item.status"
          :stagger-index="index"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TimelineItem from '@/components/TimelineItem.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { t } = useI18n()
const { el: sectionRef } = useScrollReveal()

const roadmapSection = {
  title: t('roadmap.title'),
  subtitle: t('roadmap.subtitle'),
}

const roadmap = [
  {
    quarter: t('roadmap.quarters.q1_2026.title'),
    title: t('roadmap.quarters.q1_2026.title'),
    description: t('roadmap.quarters.q1_2026.description'),
    status: t('roadmap.status.inProgress'),
  },
  {
    quarter: t('roadmap.quarters.q2_2026.title'),
    title: t('roadmap.quarters.q2_2026.title'),
    description: t('roadmap.quarters.q2_2026.description'),
    status: t('roadmap.status.planned'),
  },
  {
    quarter: t('roadmap.quarters.q3_2026.title'),
    title: t('roadmap.quarters.q3_2026.title'),
    description: t('roadmap.quarters.q3_2026.description'),
    status: t('roadmap.status.planned'),
  },
  {
    quarter: t('roadmap.quarters.q4_2026.title'),
    title: t('roadmap.quarters.q4_2026.title'),
    description: t('roadmap.quarters.q4_2026.description'),
    status: t('roadmap.status.planned'),
  },
]
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.roadmap {
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

  &__timeline {
    max-width: 640px;
    margin-inline: auto;
  }
}
</style>