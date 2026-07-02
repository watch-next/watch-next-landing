<template>
  <div class="language-switcher">
    <button
      v-for="lang in availableLanguages"
      :key="lang.code"
      :class="['lang-btn', { active: modelValue === lang.code }]"
      @click="$emit('update:modelValue', lang.code)"
      :aria-pressed="modelValue === lang.code"
    >
      {{ lang.flag }} {{ lang.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Language {
  code: string
  name: string
  flag: string
}

const availableLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [code: string]
}>()
</script>

<style scoped lang="scss">
@use '../style/tokens' as *;

.language-switcher {
  display: inline-flex;
  gap: $space-2;
  padding: $space-1;
  background: $color-glass;
  border: 1px solid $color-border;
  border-radius: $radius-md;
}

.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-3;
  font-size: $text-sm;
  font-weight: $weight-medium;
  color: $color-text-secondary;
  background: transparent;
  border: none;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $duration-fast $ease-in-out;

  &:hover {
    color: $color-text;
    background: rgba($color-primary, 0.1);
  }

  &.active {
    color: $color-primary;
    background: rgba($color-primary, 0.15);
  }

  @include reduced-motion {
    transition: none;
  }
}
</style>