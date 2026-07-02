<template>
  <section id="premium" class="premium">
    <div class="container">
      <div class="premium__header">
        <h2 class="premium__title">{{ premiumSection.title }}</h2>
        <p class="premium__subtitle">{{ premiumSection.subtitle }}</p>
      </div>
      <ul class="premium__features">
        <li v-for="feature in premiumSection.features" :key="feature" class="premium__feature">
          {{ feature }}
        </li>
      </ul>
      <button class="premium__cta">{{ premiumSection.cta }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { premiumSection } from '@/data/premium'
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.premium {
  padding-block: $space-20;
  background: $gradient-section;
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;

  &__header {
    text-align: center;
    margin-bottom: $space-12;
  }

  &__title {
    font-size: $text-4xl;
    font-weight: $weight-extrabold;
    margin-bottom: $space-4;
  }

  &__subtitle {
    font-size: $text-lg;
    color: $color-text-secondary;
  }

  &__features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: $space-6;
    list-style: none;
    padding: 0;
    margin-bottom: $space-12;
  }

  &__feature {
    font-size: $text-base;
    color: $color-text-secondary;
  }

  &__cta {
    display: block;
    margin-inline: auto;
    padding: $space-4 $space-8;
    font-size: $text-lg;
    font-weight: $weight-bold;
    color: $color-text;
    background: $gradient-btn-primary;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background-color $transition-fast, transform $transition-fast;
    box-shadow: $shadow-primary-glow;

    &:hover {
      background: $gradient-btn-primary-hover;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.97);
    }
  }
}
</style>