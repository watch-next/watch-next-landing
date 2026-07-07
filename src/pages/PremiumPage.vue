<template>
  <div class="premium-page">
    <div class="premium-page__intro">
      <h3 class="premium-page__title">{{ $t('premium.plans.title') }}</h3>
      <p class="premium-page__subtitle">{{ $t('premium.plans.subtitle') }}</p>
    </div>

    <div class="premium-page__plans">
      <div v-for="plan in plans" :key="plan.id" class="premium-page__plan-card" :class="`premium-page__plan-card--${plan.id}`">
        <div v-if="plan.badge" class="premium-page__plan-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ $t(plan.badge) }}
        </div>

        <div class="premium-page__plan-header">
          <h4 class="premium-page__plan-name">{{ $t(plan.nameKey) }}</h4>
          <p v-if="plan.description" class="premium-page__plan-description">{{ $t(plan.description) }}</p>
        </div>

        <div v-if="plan.priceKey" class="premium-page__plan-price">
          <span class="premium-page__plan-price-amount">{{ $t(plan.priceKey) }}</span>
          <span class="premium-page__plan-price-period">{{ $t(plan.periodKey) }}</span>
        </div>

        <ul class="premium-page__plan-features">
          <li v-for="feature in plan.features" :key="feature" class="premium-page__plan-feature">
            <span class="premium-page__plan-feature-icon">{{ plan.freePlan ? '✅' : '⭐' }}</span>
            {{ $t(feature) }}
          </li>
        </ul>

        <button
          v-if="plan.freePlan"
          class="premium-page__plan-button btn btn-primary"
        >
          {{ $t('premium.plans.startFree') }}
        </button>
        <button
          v-else
          class="premium-page__plan-button btn btn-primary"
          disabled
        >
          {{ $t('premium.plans.comingSoon') }}
          <span class="premium-page__plan-button-badge">{{ $t('premium.plans.soon') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const plans = [
  {
    id: 'free',
    freePlan: true,
    nameKey: 'premium.plans.free.title',
    description: 'premium.plans.free.description',
    features: [
      'premium.plans.free.features.favorites',
      'premium.plans.free.features.unlimitedWatchlist',
      'premium.plans.free.features.officialTrailers',
    ],
    buttonKey: 'premium.plans.startFree',
  },
  {
    id: 'premium',
    freePlan: false,
    badge: 'premium.plans.badge',
    nameKey: 'premium.plans.premium.title',
    priceKey: 'premium.plans.premium.price',
    periodKey: 'premium.plans.premium.period',
    description: 'premium.plans.premium.description',
    features: [
      'premium.plans.premium.features.unlimitedSync',
      'premium.plans.premium.features.personalStats',
      'premium.plans.premium.features.fullHistory',
      'premium.plans.premium.features.adFree',
      'premium.plans.premium.features.aiRecommendations',
      'premium.plans.premium.features.smartNotifications',
      'premium.plans.premium.features.exclusiveWidgets',
    ],
    footer: 'premium.plans.premium.footer',
  },
]
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.premium-page {
  &__intro {
    text-align: center;
    margin-bottom: $space-8;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0 0 $space-2 0;
  }

  &__subtitle {
    font-size: $text-base;
    color: $color-text-secondary;
    margin: 0;
  }

  &__plans {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-6;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__plan-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: $space-6;
    background: $gradient-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    transition: all $transition-fast;
    min-height: 100%;

    &--premium {
      border-color: $color-primary;
      background: linear-gradient(135deg, rgba($color-primary, 0.1) 0%, rgba($color-surface, 0.95) 100%);
    }

    @media (hover: hover) {
      &:hover {
        transform: translateY(-2px);
        border-color: $color-border-hover;
      }
    }
  }

  &__plan-badge {
    position: absolute;
    top: -$space-3;
    right: $space-4;
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    padding: $space-1 $space-3;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    background: linear-gradient(135deg, $color-primary 0%, $color-primary-active 100%);
    color: $color-text;
    border-radius: $radius-full;
    box-shadow: $shadow-primary-glow;
  }

  &__plan-header {
    margin-bottom: $space-4;
    padding-bottom: $space-4;
    border-bottom: 1px solid $color-border;
  }

  &__plan-name {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $color-text;
    margin: 0 0 $space-2 0;
  }

  &__plan-description {
    font-size: $text-sm;
    color: $color-text-secondary;
    margin: 0;
    line-height: $leading-relaxed;
  }

  &__plan-price {
    display: flex;
    align-items: baseline;
    gap: $space-1;
    margin-bottom: $space-4;
  }

  &__plan-price-amount {
    font-size: $text-3xl;
    font-weight: $weight-bold;
    color: $color-primary;
  }

  &__plan-price-period {
    font-size: $text-sm;
    color: $color-text-secondary;
  }

  &__plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 $space-6 0;
    flex-grow: 1;
  }

  &__plan-feature {
    display: flex;
    align-items: flex-start;
    gap: $space-3;
    padding: $space-2 0;
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;

    &-icon {
      flex-shrink: 0;
      font-size: $text-base;
    }
  }

  &__plan-button {
    width: 100%;
    position: relative;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__plan-button-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: $space-1 $space-3;
    font-size: $text-xs;
    font-weight: $weight-medium;
    background: rgba($color-primary, 0.2);
    color: $color-primary;
    border: 1px solid rgba($color-primary, 0.4);
    border-radius: $radius-md;
  }

  &__plan-footer {
    margin-top: $space-4;
    padding-top: $space-4;
    border-top: 1px solid $color-border;
    font-size: $text-xs;
    color: $color-text-secondary;
    text-align: center;
    line-height: $leading-relaxed;
  }
}
</style>