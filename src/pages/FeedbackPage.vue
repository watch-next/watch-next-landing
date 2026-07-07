<template>
  <div class="feedback-page">
    <div class="feedback-page__intro">
      <h1 class="feedback-page__title">{{ $t('feedback.title') }}</h1>
      <p class="feedback-page__subtitle">{{ $t('feedback.subtitle') }}</p>
    </div>

    <div class="feedback-page__categories">
      <button
        v-for="category in categories"
        :key="category.id"
        class="feedback-page__category"
        :class="{ 'feedback-page__category--active': selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        <span class="feedback-page__category-icon">{{ category.icon }}</span>
        <span class="feedback-page__category-label">{{ $t(category.label) }}</span>
      </button>
    </div>

    <form class="feedback-page__form" @submit.prevent="handleSubmit">
      <div class="feedback-page__form-group">
        <label for="name" class="feedback-page__label">{{ $t('feedback.form.name') }}</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="input"
          :placeholder="$t('feedback.form.namePlaceholder')"
        />
      </div>

      <div class="feedback-page__form-group">
        <label for="email" class="feedback-page__label">{{ $t('feedback.form.email') }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="input"
          :placeholder="$t('feedback.form.emailPlaceholder')"
        />
      </div>

      <div class="feedback-page__form-group">
        <label for="message" class="feedback-page__label feedback-page__label--required">
          {{ $t('feedback.form.message') }}
        </label>
        <textarea
          id="message"
          v-model="form.message"
          class="textarea"
          :placeholder="getMessagePlaceholder()"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? $t('feedback.form.submitting') : $t('feedback.form.submit') }}
      </button>
    </form>

    <div v-if="isSuccess" class="feedback-page__success">
      <div class="feedback-page__success-icon">✓</div>
      <h3 class="feedback-page__success-title">{{ $t('feedback.success.title') }}</h3>
      <p class="feedback-page__success-message">{{ $t('feedback.success.message') }}</p>
      <button class="btn btn-secondary" @click="resetForm">
        {{ $t('feedback.success.submitAnother') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeo } from '@/composables/useSeo'

const { t } = useI18n()

useSeo({
  title: t('feedback.seo.title'),
  description: t('feedback.seo.description'),
})

type FeedbackCategory = 'suggestion' | 'bug' | 'feature'

const categories: Array<{ id: FeedbackCategory; label: string; icon: string }> = [
  { id: 'suggestion', label: 'feedback.categories.suggestion', icon: '💡' },
  { id: 'bug', label: 'feedback.categories.bug', icon: '🐛' },
  { id: 'feature', label: 'feedback.categories.feature', icon: '✨' },
]

const selectedCategory = ref<FeedbackCategory>('suggestion')

const form = ref({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

function getMessagePlaceholder() {
  switch (selectedCategory.value) {
    case 'suggestion':
      return t('feedback.form.placeholders.suggestion')
    case 'bug':
      return t('feedback.form.placeholders.bug')
    case 'feature':
      return t('feedback.form.placeholders.feature')
    default:
      return t('feedback.form.placeholders.suggestion')
  }
}

async function handleSubmit() {
  if (!form.value.message.trim()) return

  isSubmitting.value = true

  const payload = {
    category: selectedCategory.value,
    name: form.value.name,
    email: form.value.email,
    message: form.value.message,
    timestamp: new Date().toISOString(),
  }

  console.log('Feedback submitted:', payload)

  await new Promise(resolve => setTimeout(resolve, 500))

  isSubmitting.value = false
  isSuccess.value = true
}

function resetForm() {
  form.value = { name: '', email: '', message: '' }
  isSuccess.value = false
}
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.feedback-page {
  max-width: 680px;
  margin: 0 auto;
  padding: $space-12 $space-4;

  &__intro {
    text-align: center;
    margin-bottom: $space-10;
  }

  &__title {
    font-size: $text-3xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0 0 $space-3 0;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: $text-base;
    color: $color-text-secondary;
    margin: 0;
    line-height: 1.6;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  &__categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-3;
    margin-bottom: $space-10;
  }

  &__category {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    padding: $space-5 $space-4;
    background: $color-surface;
    border: 2px solid $color-border;
    border-radius: $radius-lg;
    cursor: pointer;
    transition: all $transition-fast;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-secondary;
    min-height: 100px;

    &:hover {
      border-color: $color-primary;
      background: rgba($color-primary, 0.05);
      transform: translateY(-2px);
    }

    &--active {
      border-color: $color-primary;
      background: rgba($color-primary, 0.1);
      color: $color-primary;
      box-shadow: 0 4px 12px rgba($color-primary, 0.15);
    }

    &-icon {
      font-size: $text-3xl;
      margin-bottom: $space-1;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__label {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text;
    letter-spacing: 0.01em;

    &--required::after {
      content: ' *';
      color: $color-error;
    }
  }

  .input,
  .textarea {
    width: 100%;
    padding: $space-3 $space-4;
    font-size: $text-base;
    font-family: inherit;
    border: 2px solid $color-border;
    border-radius: $radius-md;
    background: $color-surface;
    color: $color-text;
    transition: all $transition-fast;
    box-sizing: border-box;

    &:hover {
      border-color: $color-border-hover;
    }

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }

    &::placeholder {
      color: $color-text-muted;
    }
  }

  .textarea {
    min-height: 140px;
    resize: vertical;
    line-height: 1.6;
  }

  &__success {
    margin-top: $space-10;
    text-align: center;
    padding: $space-10;
    background: linear-gradient(135deg, rgba($color-success, 0.1) 0%, rgba($color-success, 0.05) 100%);
    border: 2px solid $color-success;
    border-radius: $radius-xl;
  }

  &__success-icon {
    font-size: $text-5xl;
    color: $color-success;
    margin-bottom: $space-4;
    line-height: 1;
  }

  &__success-title {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0 0 $space-3 0;
    letter-spacing: -0.01em;
  }

  &__success-message {
    font-size: $text-base;
    color: $color-text-secondary;
    margin: 0 0 $space-6 0;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: $space-8 $space-4;

    &__categories {
      gap: $space-2;
    }

    &__category {
      min-height: 90px;
      padding: $space-4 $space-3;

      &-icon {
        font-size: $text-2xl;
      }
    }
  }

  @media (max-width: 639px) {
    padding: $space-6 $space-4;

    &__title {
      font-size: $text-2xl;
    }

    &__subtitle {
      font-size: $text-sm;
    }

    &__categories {
      grid-template-columns: 1fr;
    }

    &__category {
      min-height: 70px;
      flex-direction: row;
      justify-content: flex-start;
      padding: $space-3 $space-4;
      gap: $space-3;

      &-icon {
        font-size: $text-xl;
        margin-bottom: 0;
      }
    }

    &__success {
      padding: $space-6;
    }

    &__success-icon {
      font-size: $text-4xl;
    }

    &__success-title {
      font-size: $text-xl;
    }
  }
}
</style>