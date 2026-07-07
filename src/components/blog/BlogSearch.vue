<template>
  <div class="blog-search">
    <div class="blog-search__wrapper">
      <svg class="blog-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('blog.searchPlaceholder')"
        class="blog-search__input"
        @input="emitSearch"
      />
      <button
        v-if="searchQuery"
        class="blog-search__clear"
        @click="clearSearch"
        aria-label="Clear search"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = ref('')

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const emitSearch = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

watch(() => searchQuery.value, () => {
  emitSearch()
})
</script>

<style lang="scss" scoped>
 @use '@/style/variables' as *;
@use '@/style/variables' as *;

.blog-search {
  width: 100%;
  max-width: 480px;
  margin: 0 auto $space-8;

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    position: absolute;
    left: $space-4;
    width: 20px;
    height: 20px;
    color: $color-text-muted;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: $space-3 $space-12 $space-3 $space-12;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    color: $color-text;
    font-size: $text-base;
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px $color-primary-light;
    }

    &::placeholder {
      color: $color-text-muted;
    }
  }

  &__clear {
    position: absolute;
    right: $space-4;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-muted;
    transition: color $transition-fast;

    &:hover {
      color: $color-text;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>