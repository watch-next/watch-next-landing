<template>
  <article class="blog-card">
    <router-link :to="`/blog/${post.slug}`" class="blog-card__link">
      <div class="blog-card__image-wrapper">
        <img
          v-if="post.cover"
          :src="post.cover"
          :alt="post.title"
          class="blog-card__cover"
          loading="lazy"
        />
        <div class="blog-card__overlay"></div>
        <span v-if="post.featured" class="blog-card__featured-badge">
          {{ t('blog.featured') }}
        </span>
      </div>
      <div class="blog-card__content">
        <div class="blog-card__header">
          <span class="blog-card__category">{{ post.category }}</span>
          <span class="blog-card__reading-time">
            {{ post.readingTime }} {{ t('blog.minRead') }}
          </span>
        </div>
        <h3 class="blog-card__title">{{ post.title }}</h3>
        <p class="blog-card__description">{{ post.description }}</p>
        <div class="blog-card__footer">
          <div class="blog-card__tags" v-if="post.tags.length">
            <span class="blog-card__tag" v-for="tag in post.tags.slice(0, 3)" :key="tag">
              {{ tag }}
            </span>
          </div>
          <span class="blog-card__author">{{ post.author }}</span>
        </div>
      </div>
    </router-link>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '@/blog'

const { t } = useI18n()

defineProps<{
  post: BlogPost
}>()
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-card {
  position: relative;
  background: $gradient-surface;
  border-radius: $radius-card;
  overflow: hidden;
  transition: transform $transition-card, box-shadow $transition-card;
  border: 1px solid $color-border;
  will-change: transform, box-shadow;

  &:hover {
    transform: translateY(-6px);
    box-shadow: $shadow-card-hover;
    border-color: $color-border-hover;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }

  &__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    overflow: hidden;
  }

  &__cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-slow;
  }

  &:hover &__cover {
    transform: scale(1.05);
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent 60%, $color-surface 100%);
  }

  &__featured-badge {
    position: absolute;
    top: $space-3;
    left: $space-3;
    background: linear-gradient(135deg, $color-primary, $color-accent);
    color: $color-text;
    padding: $space-1 $space-3;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    z-index: 1;
  }

  &__content {
    padding: $space-5;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__category {
    background: $color-primary-light;
    color: $color-primary;
    padding: $space-1 $space-3;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: $weight-medium;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__reading-time {
    font-size: $text-xs;
    color: $color-text-muted;
  }

  &__title {
    font-size: $text-xl;
    font-weight: $weight-bold;
    line-height: $leading-tight;
    color: $color-text;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-2;
  }

  &__tags {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__tag {
    background: $color-surface-light;
    color: $color-text-muted;
    padding: $space-1 $space-2;
    border-radius: $radius-sm;
    font-size: $text-xs;
  }

  &__author {
    font-size: $text-xs;
    color: $color-text-muted;
  }
}
</style>