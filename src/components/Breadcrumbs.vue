<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="breadcrumbs__item"
      >
        <router-link
          v-if="crumb.to && index < crumbs.length - 1"
          :to="crumb.to"
          class="breadcrumbs__link"
        >
          {{ crumb.label }}
        </router-link>
        <span
          v-else
          class="breadcrumbs__link breadcrumbs__link--current"
          aria-current="page"
        >
          {{ crumb.label }}
        </span>
        <span
          v-if="index < crumbs.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

const props = defineProps<BreadcrumbsProps>()

const crumbs = computed(() => props.items)
</script>

<style lang="scss" scoped>
.breadcrumbs {
  margin-bottom: 1.5rem;

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  &__link {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--text-primary);
    }

    &--current {
      color: var(--text-primary);
      font-weight: 500;
      cursor: default;

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  &__separator {
    color: var(--text-secondary);
    opacity: 0.6;
  }
}
</style>