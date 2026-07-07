<template>
  <div v-if="isLoading" class="admin-layout__loading">
    <div class="admin-layout__spinner"></div>
    <p>Loading...</p>
  </div>

  <div v-else-if="!isAdmin" class="admin-layout__denied">
    <div class="admin-layout__denied-content">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this area.</p>
      <button @click="handleSignIn" class="btn btn--primary">Sign In</button>
    </div>
  </div>

  <div v-else class="admin-layout">
    <aside class="admin-layout__sidebar">
      <div class="admin-layout__logo">
        <router-link to="/admin/blog">
          <h2>Watch Next CMS</h2>
        </router-link>
      </div>

      <nav class="admin-layout__nav">
        <router-link
          to="/admin/blog"
          class="admin-layout__nav-item"
          active-class="active"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke-width="2"/>
          </svg>
          Posts
        </router-link>
        <router-link
          to="/admin/blog/new"
          class="admin-layout__nav-item"
          active-class="active"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke-width="2"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke-width="2"/>
          </svg>
          New Post
        </router-link>
        <router-link
          to="/admin/blog/trash"
          class="admin-layout__nav-item"
          active-class="active"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3,6 5,6 21,6" stroke-width="2"/>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" stroke-width="2"/>
          </svg>
          Trash
        </router-link>
        <router-link
          to="/admin/blog/settings"
          class="admin-layout__nav-item"
          active-class="active"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" stroke-width="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-width="2"/>
          </svg>
          Settings
        </router-link>
      </nav>

      <div class="admin-layout__user">
        <div class="admin-layout__user-info">
          <span class="admin-layout__user-email">{{ userEmail }}</span>
          <span class="admin-layout__user-role">Administrator</span>
        </div>
        <button @click="handleSignOut" class="admin-layout__logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-width="2"/>
            <polyline points="16,17 21,12 16,7" stroke-width="2"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </aside>

    <main class="admin-layout__content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/composables/useAdminAuth'

const router = useRouter()
const { isLoading, isAdmin, userEmail, checkAdmin, signOut } = useAdminAuth()

onMounted(() => {
  checkAdmin()
})

const handleSignIn = () => {
  router.push('/admin/login')
}

const handleSignOut = async () => {
  await signOut()
  router.push('/admin/login')
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;

  &__loading,
  &__denied {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f5f5;
  }

  &__denied-content {
    text-align: center;
    padding: $space-8;

    h1 {
      font-size: $text-3xl;
      font-weight: $weight-bold;
      color: $color-text;
      margin-bottom: $space-4;
    }

    p {
      color: $color-text-secondary;
      margin-bottom: $space-6;
    }
  }

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid $color-border;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  &__logo {
    padding: $space-6;
    border-bottom: 1px solid $color-border;

    h2 {
      font-size: $text-xl;
      font-weight: $weight-bold;
      color: $color-primary;
      margin: 0;
    }

    a {
      text-decoration: none;
    }
  }

  &__nav {
    flex: 1;
    padding: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-4;
    color: $color-text-secondary;
    text-decoration: none;
    border-radius: $radius-md;
    transition: all $transition-fast;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: $color-surface;
      color: $color-text;
    }

    &.active {
      background: $color-primary-light;
      color: $color-primary;
    }
  }

  &__user {
    padding: $space-4;
    border-top: 1px solid $color-border;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
  }

  &__user-info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    min-width: 0;
  }

  &__user-email {
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__user-role {
    font-size: $text-xs;
    color: $color-text-muted;
  }

  &__logout {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 20px;
      height: 20px;
      color: $color-text-secondary;
    }

    &:hover {
      background: $color-surface;
      border-color: $color-text-muted;

      svg {
        color: $color-text;
      }
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: $space-8;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: $bp-md) {
  .admin-layout {
    flex-direction: column;

    &__sidebar {
      width: 100%;
      height: auto;
      position: relative;
      border-right: none;
      border-bottom: 1px solid $color-border;
    }

    &__content {
      padding: $space-4;
    }
  }
}
</style>