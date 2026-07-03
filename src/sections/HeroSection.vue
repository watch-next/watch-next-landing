<template>
  <section id="hero" class="hero">
    <div class="hero__bg gradient-flow-bg"></div>
    <div class="hero__glow glow-behind"></div>
    <div class="container hero__inner">
      <div ref="heroReveal" class="hero__content reveal">
        <h1 class="hero__headline" v-html="hero.headline.replace('\n', '<br />')"></h1>
        <p class="hero__subtitle">{{ hero.subtitle }}</p>
        <div class="hero__actions">
          <a href="#features" class="hero__cta hero__cta--primary glow-pulse btn-hover-smooth">{{ hero.ctaPrimary }}</a>
          <a href="#premium" class="hero__cta hero__cta--secondary btn-hover-smooth">{{ hero.ctaSecondary }}</a>
        </div>
        <div class="hero__signup">
          <form class="hero__waitlist-form" @submit.prevent="handleAndroidSubmit">
            <input v-model="androidEmail" type="email" class="hero__email"
              :class="{ 'hero__email--error': androidError }" :placeholder="hero.emailPlaceholder"
              aria-label="Email address for Android waitlist" :disabled="androidSubmitted || isSubmittingAndroid" />
            <button type="submit" class="hero__submit" :disabled="androidSubmitted || isSubmittingAndroid">
              {{ androidSubmitted ? hero.submittedLabel : hero.submitBtn }}
            </button>
          </form>
          <div class="hero__feedback">
            <span v-if="androidError" class="hero__error" role="alert">{{ androidError }}</span>
            <span v-if="androidSubmitted" class="hero__success" role="status">{{ hero.successMessage }}</span>
          </div>
        </div>


      </div>
      <div ref="visualReveal" class="hero__visual reveal-right">
        <picture>
          <source type="image/svg+xml" srcset="@/assets/images/hero.svg" />
          <img class="hero__image float-animation" src="@/assets/images/hero.svg" alt="WatchNext dashboard preview"
            loading="eager" decoding="async" importance="high" width="560" height="350" />
        </picture>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { joinWaitlist } from '@/services/waitlist'

const { t } = useI18n()

const hero = computed(() => ({
  headline: t('hero.headline'),
  subtitle: t('hero.subtitle'),
  ctaPrimary: t('hero.ctaPrimary'),
  ctaSecondary: t('hero.ctaSecondary'),
  emailPlaceholder: t('hero.emailPlaceholder'),
  submitBtn: t('hero.submitBtn'),
  submittedLabel: t('hero.submittedLabel'),
  successMessage: t('hero.successMessage'),
}))

const { el: heroReveal } = useScrollReveal()
const { el: visualReveal } = useScrollReveal()

// Waitlist form state
const androidEmail = ref('')
const androidSubmitted = ref(false)
const androidError = ref('')
const isSubmittingAndroid = ref(false)

async function handleAndroidSubmit() {
  androidError.value = ''
  if (!androidEmail.value.trim()) {
    androidError.value = 'Email is required'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(androidEmail.value)) {
    androidError.value = 'Please enter a valid email address'
    return
  }

  isSubmittingAndroid.value = true
  const result = await joinWaitlist(androidEmail.value, 'web', 'hero')

  if (result.success) {
    androidSubmitted.value = true
    androidEmail.value = ''
  } else if (result.duplicate) {
    androidError.value = result.error || "You're already on the Android waitlist"
  } else {
    androidError.value = result.error || 'Failed to join waitlist. Please try again later.'
  }

  isSubmittingAndroid.value = false
}

// Mouse parallax effect for hero visual
onMounted(() => {
  const heroSection = document.querySelector('.hero') as HTMLElement
  const heroImage = document.querySelector('.hero__image') as HTMLElement

  if (!heroSection || !heroImage) return

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    const rect = heroSection.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    // Subtle parallax movement (max 10px)
    const strength = 10
    heroImage.style.setProperty('--parallax-x', `${x * strength}px`)
    heroImage.style.setProperty('--parallax-y', `${y * strength}px`)
  }

  const handleMouseLeave = () => {
    heroImage.style.setProperty('--parallax-x', '0px')
    heroImage.style.setProperty('--parallax-y', '0px')
  }

  heroSection.addEventListener('mousemove', handleMouseMove as EventListener)
  heroSection.addEventListener('mouseleave', handleMouseLeave as EventListener)

  onUnmounted(() => {
    heroSection.removeEventListener('mousemove', handleMouseMove as EventListener)
    heroSection.removeEventListener('mouseleave', handleMouseLeave as EventListener)
  })
})
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
    background:
      radial-gradient(ellipse 80% 60% at 50% -10%,
        rgba($color-primary, 0.15) 0%,
        transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 100%,
        rgba($color-accent, 0.08) 0%,
        transparent 50%),
      $color-background;
    z-index: $z-base;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('@/images/hero/hero_background.png') center center / cover no-repeat;
      opacity: 0.18; // ajuste entre 0.1 e 0.4
      z-index: -1;
    }
  }

  &__glow {
    position: absolute;
    top: 50%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba($color-primary, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: $z-base;
    pointer-events: none;

    @media (max-width: 1023px) {
      display: none;
    }
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
    will-change: transform, box-shadow;

    &--primary {
      color: $color-text;
      background: $gradient-btn-primary;
      box-shadow: 0 0 20px rgba($color-primary, 0.25), 0 0 40px rgba($color-primary, 0.1);

      &:hover {
        background: $gradient-btn-primary-hover;
      }
    }

    &--secondary {
      color: $color-text;
      background-color: transparent;
      border: 1px solid $color-border-hover;

      &:hover {
        border-color: $color-text-secondary;
        background-color: $color-glass-hover;
      }
    }
  }

  &__signup {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    max-width: 440px;
  }

  &__waitlist-form {
    display: flex;
    gap: $space-2;
  }

  &__feedback {
    min-height: $space-5;
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
    transition: background-color $transition-fast, transform $transition-fast, box-shadow $transition-fast;
    will-change: transform, box-shadow;

    &:hover {
      background-color: $color-accent-hover;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba($color-accent, 0.3);
    }

    &:active {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: background-color $transition-fast;
      transform: none;
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
    transform: translate(var(--parallax-x, 0), var(--parallax-y, 0));
    transition: transform 100ms ease-out;
    will-change: transform;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
      transform: none;
    }
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