<template>
  <section id="hero" class="hero">
    <div class="hero__bg"></div>
    <div class="container hero__inner">
      <div ref="heroReveal" class="hero__content reveal">
        <h1 class="hero__headline" v-html="hero.headline.replace('\n', '<br />')"></h1>
        <p class="hero__subtitle">{{ hero.subtitle }}</p>
        <div class="hero__actions">
          <a href="#features" class="hero__cta hero__cta--primary">{{ hero.ctaPrimary }}</a>
          <a href="#premium" class="hero__cta hero__cta--secondary">{{ hero.ctaSecondary }}</a>
        </div>
        <div class="hero__signup">
          <input
            type="email"
            class="hero__email"
            :placeholder="hero.emailPlaceholder"
            aria-label="Email address"
          />
          <button class="hero__submit">{{ hero.submitBtn }}</button>
        </div>
      </div>
      <div ref="visualReveal" class="hero__visual reveal-right">
        <picture>
          <source type="image/svg+xml" srcset="@/assets/images/hero.svg" />
          <img
            class="hero__image"
            src="@/assets/images/hero.svg"
            alt="WatchNext dashboard preview"
            loading="eager"
            decoding="async"
            importance="high"
            width="560"
            height="350"
          />
        </picture>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'
import { hero } from '@/data/hero'

const { el: heroReveal } = useScrollReveal()
const { el: visualReveal } = useScrollReveal()
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.hero {
  position: relative;
  padding-block: 120px $space-20;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba($color-primary, 0.15) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 100%, rgba($color-accent, 0.08) 0%, transparent 50%),
                $color-background;
    z-index: $z-base;
  }

  &__inner {
    position: relative;
    z-index: $z-base;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: $space-12;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__headline {
    font-size: $text-5xl;
    font-weight: $weight-extrabold;
    letter-spacing: $tracking-tighter;
  }

  &__subtitle {
    font-size: $text-lg;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
    max-width: 520px;
  }

  &__actions {
    display: flex;
    gap: $space-4;
    flex-wrap: wrap;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: $space-3 $space-8;
    font-size: $text-base;
    font-weight: $weight-semibold;
    border-radius: $radius-md;
    transition: background-color $transition-fast, color $transition-fast, transform $transition-fast;
    will-change: transform;

    &--primary {
      color: $color-text;
      background: $gradient-btn-primary;
      box-shadow: $shadow-primary-glow;

      &:hover {
        background: $gradient-btn-primary-hover;
        transform: scale(1.04);
      }

      &:active {
        transform: scale(0.97);
      }
    }

    &--secondary {
      color: $color-text;
      background-color: transparent;
      border: 1px solid $color-border-hover;

      &:hover {
        border-color: $color-text-secondary;
        background-color: $color-glass-hover;
        transform: scale(1.04);
      }

      &:active {
        transform: scale(0.97);
      }
    }
  }

  &__signup {
    display: flex;
    gap: $space-3;
    max-width: 440px;
  }

  &__email {
    flex: 1;
    padding: $space-3 $space-4;
    font-size: $text-sm;
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    outline: none;
    transition: border-color $transition-fast;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus {
      border-color: $color-accent;
    }
  }

  &__submit {
    padding: $space-3 $space-6;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text;
    background-color: $color-accent;
    border-radius: $radius-md;
    white-space: nowrap;
    transition: background-color $transition-fast, transform $transition-fast;
    will-change: transform;

    &:hover {
      background-color: $color-accent-hover;
      transform: scale(1.04);
    }

    &:active {
      transform: scale(0.97);
    }
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    width: 100%;
    max-width: 560px;
    height: auto;
    border-radius: $radius-lg;
  }

  @media (max-width: 1023px) {
    padding-block: 100px $space-16;

    &__inner {
      grid-template-columns: 1fr;
      gap: $space-10;
    }

    &__headline {
      font-size: $text-4xl;
    }

    &__subtitle {
      max-width: 100%;
    }

    &__visual {
      order: -1;
    }

    &__image {
      max-width: 480px;
    }
  }

  @media (max-width: 639px) {
    padding-block: 88px $space-12;

    &__headline {
      font-size: $text-3xl;
    }

    &__subtitle {
      font-size: $text-base;
    }

    &__actions {
      flex-direction: column;
    }

    &__cta {
      width: 100%;
    }

    &__signup {
      flex-direction: column;
    }
  }
}
</style>