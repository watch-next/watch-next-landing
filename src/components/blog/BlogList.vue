<template>
  <div class="blog-list">
    <div class="blog-list__grid">
      <BlogCard
        v-for="post in displayedPosts"
        :key="post.slug"
        :post="post"
      />
    </div>
    <div v-if="displayedPosts.length === 0" class="blog-list__empty">
      <p>{{ t('blog.noPostsFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BlogCard from './BlogCard.vue'
import type { BlogPost } from '@/blog'

const { t } = useI18n()

const props = defineProps<{
  posts: BlogPost[]
  filteredSlugs?: string[]
}>()

const displayedPosts = computed(() => {
  if (!props.filteredSlugs) {
    return props.posts
  }
  return props.posts.filter(post =>
    props.filteredSlugs?.includes(post.slug)
  )
})
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-list {
  width: 100%;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $space-6;

    @media (max-width: $bp-md) {
      grid-template-columns: 1fr;
    }
  }

  &__empty {
    text-align: center;
    padding: $space-12;
    color: $color-text-muted;
    font-size: $text-lg;
  }
}
</style>