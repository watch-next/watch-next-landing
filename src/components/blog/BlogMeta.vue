<template>
  <div class="blog-meta">
    <div class="blog-meta__author">
      <span class="blog-meta__label">{{ t('blog.by') }}</span>
      <span class="blog-meta__value">{{ author }}</span>
    </div>
    <div class="blog-meta__date">
      <time :datetime="date">{{ formattedDate }}</time>
    </div>
    <div class="blog-meta__reading-time">
      <span>{{ readingTime }} {{ t('blog.readingTime') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  author: string
  date: string
  readingTime: number
}>()

const formattedDate = computed(() => {
  return new Date(props.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $space-4;
  align-items: center;
  font-size: $text-sm;
  color: $color-text-muted;

  &__label {
    font-weight: $weight-medium;
  }

  &__value {
    color: $color-text-secondary;
  }

  &__date {
    time {
      color: $color-text-secondary;
    }
  }

  &__reading-time {
    &::before {
      content: '•';
      margin-right: $space-4;
    }
    span {
      color: $color-text-secondary;
    }
  }
}
</style>