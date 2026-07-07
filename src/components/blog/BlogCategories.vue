<template>
  <div class="blog-categories">
    <h3 class="blog-categories__title">{{ t('blog.categories') }}</h3>
    <div class="blog-categories__list">
      <button
        v-for="category in categories"
        :key="category"
        :class="['blog-categories__item', { active: category === selectedCategory }]"
        @click="selectCategory(category)"
      >
        {{ category }}
        <span class="blog-categories__count">{{ getCategoryCount(category) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '@/blog'

const { t } = useI18n()

const props = defineProps<{
  posts: BlogPost[]
  selectedCategory?: string
}>()

const emit = defineEmits<{
  (e: 'category-select', category: string | null): void
}>()

const categories = computed(() => {
  const categorySet = new Set(props.posts.map(post => post.category))
  return Array.from(categorySet).sort()
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  props.posts.forEach(post => {
    counts[post.category] = (counts[post.category] || 0) + 1
  })
  return counts
})

const getCategoryCount = (category: string) => categoryCounts.value[category] || 0

const selectCategory = (category: string) => {
  if (category === props.selectedCategory) {
    emit('category-select', null)
  } else {
    emit('category-select', category)
  }
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-categories {
  margin-bottom: $space-8;

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    margin-bottom: $space-4;
    color: $color-text;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__item {
    padding: $space-2 $space-4;
    background: $gradient-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    color: $color-text-secondary;
    font-size: $text-sm;
    font-weight: $weight-medium;
    cursor: pointer;
    transition: all $transition-base;
    display: flex;
    align-items: center;
    gap: $space-2;

    &:hover {
      border-color: $color-border-hover;
      color: $color-text;
    }

    &.active {
      background: $color-primary-light;
      border-color: $color-primary;
      color: $color-primary;
    }
  }

  &__count {
    background: $color-surface-light;
    padding: $space-1 $space-2;
    border-radius: $radius-full;
    font-size: $text-xs;
    color: $color-text-muted;
  }
}
</style>