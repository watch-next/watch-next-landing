<template>
  <div class="blog-author">
    <div class="blog-author__avatar" v-if="showAvatar">
      <span>{{ avatar initials }}</span>
    </div>
    <div class="blog-author__info">
      <p class="blog-author__name">{{ name }}</p>
      <p class="blog-author__role" v-if="role">{{ role }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  role?: string
  showAvatar?: boolean
}>()

const avatar = computed(() => {
  const parts = props.name.split(' ')
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
  return { initials }
})
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.blog-author {
  display: flex;
  align-items: center;
  gap: $space-3;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $color-primary, $color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $weight-bold;
    font-size: $text-sm;
    color: $color-text;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-weight: $weight-semibold;
    color: $color-text;
    font-size: $text-sm;
  }

  &__role {
    font-size: $text-xs;
    color: $color-text-muted;
  }
}
</style>