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
    max-width: 600px;
    margin-inline: auto;
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
    max-width: 800px;
    margin-inline: auto;
  }

  &__feature {
    font-size: $text-base;
    color: $color-text-secondary;
    opacity: 0;
    transform: translateY(12px);
    animation: staggerFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    @media (prefers-reduced-motion: reduce) {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }

  &__feature:nth-child(1) { animation-delay: 0ms; }
  &__feature:nth-child(2) { animation-delay: 80ms; }
  &__feature:nth-child(3) { animation-delay: 160ms; }
  &__feature:nth-child(4) { animation-delay: 240ms; }
  &__feature:nth-child(5) { animation-delay: 320ms; }
  &__feature:nth-child(6) { animation-delay: 400ms; }

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
    transition: background-color $transition-fast, transform $transition-fast, box-shadow $transition-base;
    box-shadow: $shadow-primary-glow;
    will-change: box-shadow;
    animation: glowPulse 3s ease-in-out infinite;

    &:hover {
      background: $gradient-btn-primary-hover;
      transform: scale(1.05) translateY(-2px);
    }

    &:active {
      transform: scale(0.97) translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      transition: background-color $transition-fast;
      &:hover {
        transform: none;
      }
    }
  }
}
</style>