<template>
  <header class="header" role="banner">
    <div class="container header__inner">
      <div class="header__logo">
        <span class="header__logo-text">Watch</span>
        <span class="header__logo-text-sub">Next</span>
      </div>

      <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }" role="navigation" aria-label="Main navigation" id="main-nav">
        <ul class="header__nav-list">
          <li v-for="link in navLinks" :key="link.label" class="header__nav-item">
            <a :href="link.href" class="header__nav-link link-hover" @click="closeMenu">{{ link.label }}</a>
          </li>
        </ul>
        <button class="header__login-btn">Login</button>
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
import { ref } from 'vue'
import { navLinks } from '@/data/navigation'

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}
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
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    transition: color $transition-fast;

    &:hover {
      color: $color-text;
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
}
</style>