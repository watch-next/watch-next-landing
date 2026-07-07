<template>
  <div class="admin-login-page">
    <div class="admin-login-page__container">
      <div class="admin-login-page__card">
        <header class="admin-login-page__header">
          <h1>Watch Next CMS</h1>
          <p>Sign in to manage your blog</p>
        </header>

        <form @submit.prevent="handleSubmit" class="admin-login-page__form">
          <div class="admin-login-page__field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="admin-login-page__field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="error" class="admin-login-page__error">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn--primary btn--full"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="admin-login-page__footer">
          <router-link to="/">← Back to site</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/composables/useAdminAuth'

const router = useRouter()
const { signIn } = useAdminAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  const result = await signIn(email.value, password.value)

  isLoading.value = false

  if (result.error) {
    error.value = result.error
  } else {
    router.push('/admin/blog')
  }
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-background;
  padding: $space-8;
}

.admin-login-page__container {
  width: 100%;
  max-width: 440px;
}

.admin-login-page__card {
  background: white;
  border-radius: $radius-xl;
  padding: $space-8;
  box-shadow: $shadow-lg;
}

.admin-login-page__header {
  text-align: center;
  margin-bottom: $space-8;

  h1 {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-primary;
    margin: 0 0 $space-2;
  }

  p {
    color: $color-text-secondary;
    margin: 0;
  }
}

.admin-login-page__form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.admin-login-page__field {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  label {
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text;
  }

  input {
    padding: $space-3 $space-4;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $text-base;
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px $color-primary-light;
    }
  }
}

.admin-login-page__error {
  padding: $space-3;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: $radius-md;
  color: #dc2626;
  font-size: $text-sm;
}

.admin-login-page__footer {
  margin-top: $space-6;
  text-align: center;

  a {
    color: $color-text-secondary;
    text-decoration: none;
    font-size: $text-sm;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>