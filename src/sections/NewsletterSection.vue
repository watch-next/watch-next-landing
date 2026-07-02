<template>
  <section id="newsletter" class="newsletter">
    <div class="container">
      <div ref="cardRef" class="newsletter__card reveal">
        <h2 class="newsletter__title">{{ newsletter.title }}</h2>
        <p class="newsletter__description">{{ newsletter.description }}</p>
        <form class="newsletter__form" novalidate @submit.prevent="handleSubmit">
          <div class="newsletter__input-wrapper">
            <input
              id="newsletter-email"
              v-model="email"
              type="email"
              class="newsletter__input"
              :class="{ 'newsletter__input--error': error }"
              :placeholder="newsletter.placeholder"
              aria-describedby="newsletter-error"
              autocomplete="email"
            />
            <span v-if="error" id="newsletter-error" class="newsletter__error" role="alert">
              {{ error }}
            </span>
          </div>
          <button type="submit" class="newsletter__submit" :disabled="submitted">
            {{ submitted ? newsletter.submittedLabel : newsletter.submitLabel }}
          </button>
        </form>
        <p v-if="submitted" class="newsletter__success" role="status">
          {{ newsletter.successMessage }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { newsletter } from '@/data/newsletter'

const { el: cardRef } = useScrollReveal()

const email = ref('')
const error = ref('')
const submitted = ref(false)

function validate(email: string): string {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address'
  return ''
}

function handleSubmit() {
  error.value = ''
  const validationError = validate(email.value)
  if (validationError) {
    error.value = validationError
    return
  }
  submitted.value = true
  email.value = ''
}
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.newsletter {
  padding-block: $space-20;

  &__card {
    max-width: 640px;
    margin-inline: auto;
    padding: $space-12 $space-8;
    text-align: center;
    background: $gradient-card;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid $color-border;
    border-radius: $radius-xl;
  }

  &__title {
    font-size: $text-3xl;
    font-weight: $weight-extrabold;
    margin-bottom: $space-4;
  }

  &__description {
    font-size: $text-base;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
    margin-bottom: $space-8;
  }

  &__form {
    display: flex;
    gap: $space-3;
    max-width: 480px;
    margin-inline: auto;
  }

  &__input-wrapper {
    flex: 1;
    position: relative;
  }

  &__input {
    width: 100%;
    padding: $space-3 $space-4;
    font-size: $text-sm;
    color: $color-text;
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

    &--error {
      border-color: $color-error;
    }
  }

  &__error {
    position: absolute;
    left: 0;
    bottom: -1.25rem;
    font-size: $text-xs;
    color: $color-error;
  }

  &__submit {
    padding: $space-3 $space-6;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text;
    background-color: $color-primary;
    border-radius: $radius-md;
    white-space: nowrap;
    transition: background-color $transition-fast, transform $transition-fast, box-shadow $transition-fast;
    will-change: transform, box-shadow;

    &:hover:not(:disabled) {
      background-color: $color-primary-hover;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(62, 139, 255, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }

    &:disabled {
      background-color: $color-gray-400;
      cursor: default;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: background-color $transition-fast;
      &:hover:not(:disabled) {
        transform: none;
      }
    }
  }

  &__success {
    margin-top: $space-6;
    font-size: $text-sm;
    color: $color-success;
    font-weight: $weight-medium;
  }

  @media (max-width: 639px) {
    padding-block: $space-12 $space-16;

    &__card {
      padding: $space-8 $space-6;
    }

    &__title {
      font-size: $text-2xl;
    }

    &__form {
      flex-direction: column;
    }

    &__error {
      position: static;
      margin-top: $space-1;
    }
  }
}
</style>