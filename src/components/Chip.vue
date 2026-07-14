<template>
  <span class="chip">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<style lang="scss" scoped>
.chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  margin: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-radius: 9999px;
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--brand-primary);
  }
}
</style>