<template>
  <section class="faq-section">
    <div class="container">
      <div class="faq-section__header">
        <h2 class="faq-section__title">{{ $t('faq.section.title') }}</h2>
        <p class="faq-section__subtitle">{{ $t('faq.section.subtitle') }}</p>
      </div>

      <div class="faq-section__items">
        <div
          v-for="(item, index) in faqItems"
          :key="index"
          class="faq-item"
          :class="{ 'faq-item--active': activeIndex === index }"
        >
          <button
            class="faq-item__question"
            @click="toggleItem(index)"
            :aria-expanded="activeIndex === index"
            :aria-controls="`faq-answer-${index}`"
          >
            <span class="faq-item__question-text">{{ item.question }}</span>
            <span class="faq-item__icon" :class="{ 'faq-item__icon--active': activeIndex === index }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
          <div
            :id="`faq-answer-${index}`"
            class="faq-item__answer"
            role="region"
            :aria-labelledby="`faq-question-${index}`"
            v-show="activeIndex === index"
          >
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFaqJsonLd } from '@/composables/useSeo'

const { tm } = useI18n()

const activeIndex = ref<number | null>(null)

function toggleItem(index: number) {
  activeIndex.value = activeIndex.value === index ? null : index
}

// Get FAQ items from locale messages using tm() for raw translation values
const faqItems = computed(() => {
  const items = tm('faq.items')
  return Array.isArray(items) ? items : []
})

useFaqJsonLd(faqItems.value)
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.faq-section {
  padding: $space-16 0;
  background-color: $color-surface;

  &__header {
    text-align: center;
    margin-bottom: $space-12;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0 0 $space-4 0;
  }

  &__subtitle {
    font-size: $text-base;
    color: $color-text-secondary;
    margin: 0;
  }

  &__items {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }
}

.faq-item {
  background-color: $color-background;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  overflow: hidden;
  transition: all $transition-base;

  &--active {
    border-color: $color-primary;
    box-shadow: 0 0 0 1px $color-primary;
  }

  &__question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: $space-5 $space-6;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: $text-base;
    font-weight: $weight-medium;
    color: $color-text;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-surface-hover;
    }

    &-text {
      flex: 1;
      padding-right: $space-4;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    background-color: $color-surface;
    color: $color-text-secondary;
    transition: transform $transition-base;

    &--active {
      transform: rotate(135deg);
      background-color: $color-primary;
      color: white;
    }

    svg {
      transition: transform $transition-base;
    }
  }

  &__answer {
    padding: 0 $space-6 $space-6;
    color: $color-text-secondary;
    line-height: $leading-relaxed;

    p {
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    &__question {
      padding: $space-4 $space-5;
      font-size: $text-sm;
    }

    &__answer {
      padding: 0 $space-5 $space-5;
      font-size: $text-sm;
    }
  }
}
</style>