<template>
  <div class="blog-tags">
    <h3 class="blog-tags__title">{{ t('blog.tags') }}</h3>
    <div class="blog-tags__cloud">
      <button
        v-for="tag in tags"
        :key="tag"
        :class="['blog-tags__item', { active: tag === selectedTag }]"
        @click="selectTag(tag)"
      >
        {{ tag }}
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
  selectedTag?: string
}>()

const emit = defineEmits<{
  (e: 'tag-select', tag: string | null): void
}>()

const tags = computed(() => {
  const tagSet = new Set<string>()
  props.posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

const selectTag = (tag: string) => {
  if (tag === props.selectedTag) {
    emit('tag-select', null)
  } else {
    emit('tag-select', tag)
  }
}
</script>

<style lang="scss" scoped>
 @use '@/style/variables' as *;
@use '@/style/variables' as *;

.blog-tags {
  margin-bottom: $space-8;

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    margin-bottom: $space-4;
    color: $color-text;
  }

  &__cloud {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__item {
    padding: $space-2 $space-3;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-secondary;
    font-size: $text-sm;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: $color-accent;
      color: $color-accent;
    }

    &.active {
      background: $color-accent;
      border-color: $color-accent;
      color: white;
    }
  }
}
</style>