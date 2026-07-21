<template>
  <article v-if="post" class="blog-post">
    <div class="container blog-post__container">
      <header class="blog-post__header">
        <nav class="blog-post__breadcrumb" aria-label="Breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb__item">
              <router-link to="/" class="breadcrumb__link">
                {{ t('common.home') }}
              </router-link>
            </li>
            <li class="breadcrumb__item">
              <router-link to="/blog" class="breadcrumb__link">
                {{ t('blog.title') }}
              </router-link>
            </li>
            <li class="breadcrumb__item" aria-current="page">
              <span class="breadcrumb__current">{{ post.title }}</span>
            </li>
          </ol>
        </nav>

        <div class="blog-post__meta-header">
          <span class="blog-post__category" :style="{ backgroundColor: categoryColor }">
            {{ post.category }}
          </span>
          <BlogMeta
            :author="post.author"
            :date="post.date"
            :reading-time="post.readingTime"
          />
        </div>

        <h1 class="blog-post__title">{{ post.title }}</h1>

        <p class="blog-post__description">{{ post.description }}</p>

        <div class="blog-post__tags" v-if="post.tags.length">
          <span class="blog-post__tags-label">{{ t('blog.tags') }}:</span>
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="blog-post__tag"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <figure v-if="post.cover" class="blog-post__cover-figure">
        <img
          :src="post.cover"
          :alt="post.title"
          class="blog-post__cover"
          loading="lazy"
        />
        <figcaption v-if="post.author" class="blog-post__cover-caption">
          {{ t('blog.coverCredit', { author: post.author }) }}
        </figcaption>
      </figure>

      <!-- AdSense Banner após a imagem de capa -->
      <AdSenseAd
        format="auto"
        layout="in-article"
        responsive
        class="blog-post__ad"
      />

      <div class="blog-post__content">
        <MarkdownRenderer :content="post.content" />
      </div>

      <!-- AdSense Banner após o conteúdo -->
      <AdSenseAd
        format="auto"
        layout="in-feed"
        responsive
        class="blog-post__ad"
      />

      <footer class="blog-post__footer">
        <div v-if="relatedPosts.length" class="blog-post__related">
          <h2 class="blog-post__related-title">{{ t('blog.relatedArticles') }}</h2>
          <div class="blog-post__related-grid">
            <BlogCard
              v-for="related in relatedPosts"
              :key="related.slug"
              :post="related"
            />
          </div>
        </div>
      </footer>
    </div>
  </article>

  <div v-else class="blog-post blog-post--not-found">
    <div class="container">
      <div class="blog-post__not-found">
        <h1>{{ t('blog.postNotFound') }}</h1>
        <p>{{ t('blog.postNotFoundDescription') }}</p>
        <router-link to="/blog" class="btn btn--primary">
          {{ t('blog.backToBlog') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { SupabaseBlogProvider, findRelatedPosts, getCategoryColor } from '@/blog'
import { useSeo } from '@/composables/useSeo'
import BlogMeta from '@/components/blog/BlogMeta.vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer.vue'
import AdSenseAd from '@/components/ads/AdSenseAd.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const props = defineProps<{
  slug: string
}>()

const post = ref<Awaited<ReturnType<typeof SupabaseBlogProvider.prototype.getPost>>>(null)
const allPosts = ref<Awaited<ReturnType<typeof SupabaseBlogProvider.prototype.getPosts>>>([])
const relatedPosts = ref<Awaited<ReturnType<typeof SupabaseBlogProvider.prototype.getPosts>>>([])

const blogProvider = new SupabaseBlogProvider()

const canonicalUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://watchnext.app'
  return `${baseUrl}/blog/${props.slug}`
})

// Setup SEO
useSeo({
  title: computed(() => post.value ? `${post.value.title} | Watch Next Blog` : ''),
  description: computed(() => post.value?.description || ''),
  url: computed(() => canonicalUrl.value),
  openGraph: computed(() => post.value ? {
    title: post.value.title,
    description: post.value.description,
    type: 'article',
    publishedTime: post.value.date,
    authors: [post.value.author],
    images: post.value.cover ? [post.value.cover] : [],
  } : undefined),
  twitter: computed(() => post.value ? {
    card: 'summary_large_image',
    title: post.value.title,
    description: post.value.description,
    image: post.value.cover,
  } : undefined),
})

// Structured data (Schema.org)
const structuredData = computed(() => {
  if (!post.value) return null

  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://watchnext.app'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.value.title,
    description: post.value.description,
    image: post.value.cover ? new URL(post.value.cover, baseUrl).href : undefined,
    author: {
      '@type': 'Organization',
      name: post.value.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Watch Next',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: post.value.date,
    dateModified: post.value.date,
    articleSection: post.value.category,
    keywords: post.value.tags.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl.value,
    },
  }
})

const breadcrumbData = computed(() => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://watchnext.app'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('common.home'),
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('blog.title'),
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.value?.title || props.slug,
        item: canonicalUrl.value,
      },
    ],
  }
})

// Add structured data to head
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: structuredData,
    },
    {
      type: 'application/ld+json',
      children: breadcrumbData,
    },
  ],
})

const categoryColor = computed(() => {
  if (!post.value) return '#6b7280'
  return getCategoryColor(post.value.category)
})

const loadPost = async () => {
  if (!props.slug) return

  post.value = await blogProvider.getPost(props.slug)
  allPosts.value = await blogProvider.getPosts()

  if (post.value && allPosts.value.length) {
    relatedPosts.value = findRelatedPosts(post.value, allPosts.value)
  }
}

watch(() => props.slug, loadPost, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-post {
  min-height: 100vh;
  padding: $space-12 0 $space-12;
  background: $color-background;

  &__container {
    max-width: $content-max-width;
    margin: 0 auto;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $space-6;
    margin-bottom: $space-10;
  }

  &__breadcrumb {
    margin-bottom: $space-4;
  }

  &__meta-header {
    display: flex;
    align-items: center;
    gap: $space-4;
    flex-wrap: wrap;
  }

  &__category {
    padding: $space-2 $space-4;
    background: $color-primary-light;
    color: $color-primary;
    border-radius: $radius-full;
    font-size: $text-sm;
    font-weight: $weight-medium;
  }

  &__title {
    font-size: $text-4xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0;
    line-height: $leading-tight;
  }

  &__description {
    font-size: $text-xl;
    color: $color-text-secondary;
    margin: 0;
    line-height: $leading-relaxed;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: $space-3;
    flex-wrap: wrap;

    &-label {
      font-weight: $weight-medium;
      color: $color-text-muted;
      font-size: $text-sm;
    }
  }

  &__tag {
    padding: $space-1 $space-3;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-size: $text-sm;
    color: $color-text-secondary;
  }

  &__cover-figure {
    margin: 0 0 $space-10;
    border-radius: $radius-card;
    overflow: hidden;
    border: 1px solid $color-border;
  }

  &__cover {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  &__cover-caption {
    padding: $space-3 $space-4;
    background: $gradient-surface;
    text-align: center;
    font-size: $text-sm;
    color: $color-text-muted;
    border-top: 1px solid $color-border;
  }

  &__content {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 $space-4;
  }

  &__footer {
    margin-top: $space-12;
    padding-top: $space-10;
    border-top: 1px solid $color-border;
  }

  &__related {
    margin-top: $space-8;

    &-title {
      font-size: $text-2xl;
      font-weight: $weight-semibold;
      margin-bottom: $space-6;
      color: $color-text;
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: $space-6;
    }
  }

  &--not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  &__not-found {
    text-align: center;
    padding: $space-12;

    h1 {
      font-size: $text-3xl;
      font-weight: $weight-bold;
      color: $color-text;
      margin-bottom: $space-4;
    }

    p {
      font-size: $text-lg;
      color: $color-text-secondary;
      margin-bottom: $space-6;
    }
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: $space-2;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $text-sm;

    &::after {
      content: '/';
      color: $color-text-muted;
      margin-left: $space-2;
    }

    &:last-child::after {
      display: none;
    }
  }

  &__link {
    color: $color-primary;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary-dark;
      text-decoration: underline;
    }
  }

  &__current {
    color: $color-text-secondary;
  }
}

@media (max-width: $bp-md) {
  .blog-post {
    padding: $space-6 0;

    &__title {
      font-size: $text-3xl;
    }

    &__description {
      font-size: $text-lg;
    }
  }
}
</style>