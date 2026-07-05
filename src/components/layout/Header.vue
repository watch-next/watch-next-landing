<template>
  <header class="header" :data-scrolled="scrolled" role="banner">
    <div class="container header__inner">
      <div class="header__logo">
        <span class="header__logo-text">Watch</span>
        <span class="header__logo-text-sub">Next</span>
      </div>

      <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }" role="navigation" aria-label="Main navigation" id="main-nav">
        <ul class="header__nav-list">
          <li v-for="link in navLinks" :key="link.href" class="header__nav-item">
            <a :href="link.href" class="header__nav-link link-hover" @click="handleNavClick(link)">{{ link.label }}</a>
          </li>
        </ul>
        <button class="header__login-btn">{{ t('navigation.login') }}</button>

        <div class="header__lang-switcher">
          <button class="header__lang-btn" @click="toggleLangMenu" aria-label="Select language">
            {{ languages.find(l => l.code === currentLang)?.label }}
          </button>
          <ul v-if="showLangMenu" class="header__lang-dropdown">
            <li v-for="lang in languages" :key="lang.code">
              <button @click="selectLang(lang.code)">{{ lang.label }}</button>
            </li>
          </ul>
        </div>
      </nav>

      <button class="header__menu-toggle" aria-label="Toggle menu" :aria-expanded="menuOpen" aria-controls="main-nav" @click="toggleMenu">
        <span class="header__menu-bar"></span>
        <span class="header__menu-bar"></span>
        <span class="header__menu-bar"></span>
      </button>

      <div v-if="menuOpen" class="header__overlay" @click="closeMenu"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { trackEvent, trackNavigation, trackLanguageChange } from '@/services/analytics'

const { t, locale } = useI18n()

const menuOpen = ref(false)
const scrolled = ref(false)
const showLangMenu = ref(false)

const navLinks = [
  { label: t('navigation.home'), href: '#hero' },
  { label: t('navigation.features'), href: '#features' },
  { label: t('navigation.platforms'), href: '#platforms' },
  { label: t('navigation.premium'), href: '#premium' },
  { label: t('navigation.roadmap'), href: '#roadmap' },
]

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es', label: 'Español' },
]

const currentLang = ref(locale.value)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleNavClick(link: { label: string; href: string }) {
  trackEvent(trackNavigation(link.label, 'header'))
  closeMenu()
}

function toggleLangMenu() {
  showLangMenu.value = !showLangMenu.value
}

function selectLang(code: string) {
  const from = locale.value
  locale.value = code
  currentLang.value = code
  showLangMenu.value = false
  localStorage.setItem('watchnext-locale', code)
  trackEvent(trackLanguageChange(from, code))
}

onMounted(() => {
  const savedLang = localStorage.getItem('watchnext-locale')
  if (savedLang && ['en', 'pt-BR', 'es'].includes(savedLang)) {
    locale.value = savedLang
    currentLang.value = savedLang
  }
})

// Scroll detection for header animation
const handleScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-sticky;
  background-color: $color-overlay-darker;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid $color-border;
  transition: background-color $transition-base, backdrop-filter $transition-base, box-shadow $transition-base;
  will-change: background-color, backdrop-filter;

  &[data-scrolled="true"] {
    background-color: rgba(2, 3, 26, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-1;
  }

  &__logo-text {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $color-text;
  }

  &__logo-text-sub {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $brand-highlight;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: $space-8;

    @media (max-width: 767px) {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background: $color-overlay-darker;
      flex-direction: column;
      padding: $space-8;
      opacity: 0;
      pointer-events: none;
      transition: opacity $transition-base;

      &--open {
        opacity: 1;
        pointer-events: all;
      }
    }
  }

  &__nav-list {
    display: flex;
    gap: $space-6;

    @media (max-width: 767px) {
      flex-direction: column;
      align-items: center;
    }
  }

  &__nav-link {
    position: relative;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    transition: color $transition-fast;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: $gradient-btn-primary;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform $transition-base;
    }

    &:hover {
      color: $color-text;

      &::after {
        transform: scaleX(1);
      }
    }

    &.active::after {
      transform: scaleX(1);
      animation: indicatorGrow $transition-base ease-out;
    }
  }

  &__login-btn {
    padding: $space-2 $space-5;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    transition: all $transition-base;

    &:hover {
      background: $color-surface-hover;
      border-color: $color-primary;
    }
  }

  &__menu-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: $space-2;
    background: none;
    border: none;

    @media (max-width: 767px) {
      display: flex;
    }
  }

  &__menu-bar {
    display: block;
    width: 24px;
    height: 2px;
    background: $color-text;
    border-radius: $radius-full;
    transition: transform $transition-base, opacity $transition-base;
  }

  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba($color-background, 0.5);
    z-index: $z-below;

    @media (max-width: 767px) {
      position: absolute;
      top: 100%;
    }
  }

  &__lang-switcher {
    position: relative;
    z-index: $z-dropdown;
  }

  &__lang-btn {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-4;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    &::after {
      content: '';
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid currentColor;
    }

    &:hover {
      border-color: $color-primary;
    }
  }

  &__lang-dropdown {
    position: absolute;
    top: calc(100% + #{$space-2});
    right: 0;
    min-width: 160px;
    padding: $space-2;
    list-style: none;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: $z-dropdown;

    li {
      button {
        width: 100%;
        padding: $space-2 $space-4;
        font-size: $text-sm;
        color: $color-text;
        text-align: left;
        background: none;
        border: none;
        border-radius: $radius-sm;
        cursor: pointer;
        transition: background $transition-fast;
        white-space: nowrap;

        &:hover {
          background: rgba($color-primary, 0.1);
        }
      }
    }
  }
}
</style>