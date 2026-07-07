<template>
  <div class="blog-page">
    <div class="container blog-page__container">
      <header class="blog-page__header">
        <h1 class="blog-page__title">{{ t('blog.title') }}</h1>
        <p class="blog-page__subtitle">{{ t('blog.subtitle') }}</p>
      </header>

      <BlogSearch @search="handleSearch" />

      <div class="blog-page__filters">
        <BlogCategories
          :posts="posts"
          :selected-category="selectedCategory"
          @category-select="handleCategorySelect"
        />
        <BlogTags
          :posts="posts"
          :selected-tag="selectedTag"
          @tag-select="handleTagSelect"
        />
      </div>

      <BlogList
        :posts="posts"
        :filtered-slugs="filteredSlugs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SupabaseBlogProvider, buildSearchIndex, searchPosts } from '@/blog'
import BlogSearch from '@/components/blog/BlogSearch.vue'
import BlogList from '@/components/blog/BlogList.vue'
import BlogCategories from '@/components/blog/BlogCategories.vue'
import BlogTags from '@/components/blog/BlogTags.vue'

const { t } = useI18n()

const posts = ref<Awaited<ReturnType<typeof SupabaseBlogProvider.prototype.getPosts>>>([])
const searchQuery = ref('')
const selectedCategory = ref<string | undefined>()
const selectedTag = ref<string | undefined>()

const blogProvider = new SupabaseBlogProvider()

onMounted(async () => {
  posts.value = await blogProvider.getPosts()
})

const searchIndex = computed(() => buildSearchIndex(posts.value))

const filteredSlugs = computed(() => {
  let result = posts.value.map(p => p.slug)

  if (searchQuery.value) {
    const matched = searchPosts(searchQuery.value, searchIndex.value)
    result = result.filter(slug => matched.includes(slug))
  }

  if (selectedCategory.value) {
    result = result.filter(slug => {
      const post = posts.value.find(p => p.slug === slug)
      return post?.category === selectedCategory.value
    })
  }

  if (selectedTag.value) {
    result = result.filter(slug => {
      const post = posts.value.find(p => p.slug === slug)
      return post?.tags.includes(selectedTag.value || '')
    })
  }

  return result
})

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleCategorySelect = (category: string | null) => {
  selectedCategory.value = category || undefined
}

const handleTagSelect = (tag: string | null) => {
  selectedTag.value = tag || undefined
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-page {
  min-height: 100vh;
  padding: $space-12 0 $space-24;
  background: $color-background;
}

.blog-page__container {
  display: flex;
  flex-direction: column;
  gap: $space-8;
}

.blog-page__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
}

.blog-page__title {
  font-size: $text-4xl;
  font-weight: $weight-bold;
  color: $color-text;
  margin: 0;
}

.blog-page__subtitle {
  font-size: $text-lg;
  color: $color-text-secondary;
  margin: 0;
  max-width: 600px;
}

.blog-page__filters {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

@media (max-width: $bp-md) {
  .blog-page {
    padding: $space-8 0;
  }

  .blog-page__title {
    font-size: $text-3xl;
  }
}
</style>