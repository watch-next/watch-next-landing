<template>
  <div class="markdown-renderer" v-if="content">
    <div class="markdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

const renderedContent = computed(() => {
  try {
    return marked.parse(props.content || '')
  } catch (e) {
    console.error('Failed to parse markdown:', e)
    return props.content
  }
})
</script>

<style lang="scss" scoped>
 @use '@/style/variables' as *;
@use '@/style/variables' as *;

.markdown-renderer {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.markdown-content {
  color: $color-text;
  line-height: $leading-relaxed;

  :deep(h1) {
    font-size: $text-4xl;
    font-weight: $weight-bold;
    margin-bottom: $space-6;
    line-height: $leading-tight;
  }

  :deep(h2) {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    margin-top: $space-12;
    margin-bottom: $space-4;
  }

  :deep(h3) {
    font-size: $text-xl;
    font-weight: $weight-semibold;
    margin-top: $space-8;
    margin-bottom: $space-3;
  }

  :deep(h4) {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    margin-top: $space-6;
    margin-bottom: $space-2;
  }

  :deep(p) {
    margin-bottom: $space-6;
    line-height: $leading-relaxed;
  }

  :deep(a) {
    color: $color-primary;
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary-hover;
    }
  }

  :deep(strong) {
    font-weight: $weight-bold;
    color: $color-text;
  }

  :deep(em) {
    font-style: italic;
    color: $color-text-secondary;
  }

  :deep(ul) {
    margin-bottom: $space-6;
    padding-left: $space-8;
    list-style-type: disc;

    li {
      margin-bottom: $space-2;
      color: $color-text-secondary;
    }
  }

  :deep(ol) {
    margin-bottom: $space-6;
    padding-left: $space-8;
    list-style-type: decimal;

    li {
      margin-bottom: $space-2;
      color: $color-text-secondary;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid $color-primary;
    padding-left: $space-4;
    margin: $space-6 0;
    color: $color-text-muted;
    font-style: italic;
  }

  :deep(code) {
    background-color: $color-surface;
    padding: $space-1 $space-2;
    border-radius: $radius-sm;
    font-family: $font-mono;
    font-size: $text-sm;
    color: $color-primary;
  }

  :deep(pre) {
    background-color: $color-surface;
    padding: $space-4;
    border-radius: $radius-md;
    overflow-x: auto;
    margin: $space-6 0;

    code {
      background: none;
      padding: 0;
      font-size: $text-sm;
      line-height: $leading-loose;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: $space-6 0;
    border-radius: $radius-lg;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid $color-border;
    margin: $space-12 0;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: $space-6 0;

    th, td {
      border: 1px solid $color-border;
      padding: $space-3;
      text-align: left;
    }

    th {
      background-color: $color-surface;
      font-weight: $weight-semibold;
    }
  }
}
</style>