<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <span class="footer__logo">Watch<span class="footer__logo-sub">Next</span></span>

          <p class="footer__description">{{ footerSection.brandDescription }}</p>
          <ul class="footer__social">
            <li v-for="social in socialLinks" :key="social.label">
              <a :href="social.href" class="footer__social-link" :aria-label="social.label">
                {{ social.label.charAt(0) }}
              </a>
            </li>
          </ul>
        </div>

        <div v-for="group in footerNav" :key="group.heading" class="footer__group">
          <h3 class="footer__group-title">{{ group.heading }}</h3>
          <ul class="footer__group-list">
            <li v-for="link in group.links" :key="link.label">
              <a :href="link.href" class="footer__link link-hover">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">
          &copy; {{ year }} WatchNext. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const footerSection = {
  brandDescription: t('footer.brandDescription'),
}

const footerNav = [
  {
    heading: t('footer.navigation.heading'),
    links: [
      { label: t('footer.navigation.home'), href: '#hero' },
      { label: t('footer.navigation.features'), href: '#features' },
      { label: t('footer.navigation.platforms'), href: '#platforms' },
      { label: t('footer.navigation.premium'), href: '#premium' },
      { label: t('footer.navigation.roadmap'), href: '#roadmap' },
    ],
  },
  {
    heading: t('footer.platforms.heading'),
    links: [
      { label: t('footer.platforms.web'), href: '#' },
      { label: t('footer.platforms.windows'), href: '#' },
      { label: t('footer.platforms.android'), href: '#' },
    ],
  },
  {
    heading: t('footer.legal.heading'),
    links: [
      { label: t('footer.legal.privacy'), href: '#' },
      { label: t('footer.legal.terms'), href: '#' },
      { label: t('footer.legal.cookies'), href: '#' },
    ],
  },
]

const socialLinks = [
  { label: t('footer.social.twitter'), href: '#' },
  { label: t('footer.social.github'), href: '#' },
  { label: t('footer.social.discord'), href: '#' },
]

const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.footer {
  padding-block: $space-16 $space-8;
  background-color: $color-surface;
  border-top: 1px solid $color-border;

  &__grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: $space-12;
    margin-bottom: $space-12;
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__logo {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $color-text;

    &-sub {
      color: $brand-highlight;
    }
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
  }

  &__social {
    display: flex;
    gap: $space-3;
    margin-top: $space-2;
  }

  &__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: $text-sm;
    font-weight: $weight-bold;
    color: $color-text-secondary;
    background: $color-surface-light;
    border-radius: $radius-full;
    transition: all $transition-base;

    &:hover {
      color: $color-text;
      background: $color-primary;
      transform: translateY(-2px);
    }
  }

  &__group-title {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text;
    margin-bottom: $space-4;
    text-transform: uppercase;
    letter-spacing: $tracking-wider;
  }

  &__group-list {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__link {
    font-size: $text-sm;
    color: $color-text-secondary;
    transition: color $transition-fast;

    &:hover {
      color: $color-text;
    }
  }

  &__bottom {
    padding-top: $space-8;
    border-top: 1px solid $color-border;
    text-align: center;
  }

  &__copyright {
    font-size: $text-xs;
    color: $color-text-muted;
  }

  @media (max-width: 992px) {
    &__grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 639px) {
    &__grid {
      grid-template-columns: 1fr;
      gap: $space-8;
    }

    &__brand {
      text-align: center;
      align-items: center;
    }

    &__social {
      justify-content: center;
    }
  }
}
</style>