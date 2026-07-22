<template>
  <div class="admin-login-page">
    <div class="admin-login-page__container">
      <div class="admin-login-page__card">
        <header class="admin-login-page__header">
          <h1>SeeUs CMS</h1>
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
  background: $gradient-surface;
  border-radius: $radius-card;
  padding: $space-8;
  box-shadow: $shadow-card;
  border: 1px solid $color-border;
}

.admin-login-page__header {
  text-align: center;
  margin-bottom: $space-8;

  h1 {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    background: linear-gradient(135deg, $color-primary, $color-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 $space-2;
  }

  p {
    color: $color-text-muted;
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
    @include input-base;
  }
}

.admin-login-page__error {
  padding: $space-3;
  background: rgba($color-error, 0.1);
  border: 1px solid $color-error;
  border-radius: $radius-md;
  color: $color-error;
  font-size: $text-sm;
}

.admin-login-page__footer {
  margin-top: $space-6;
  text-align: center;

  a {
    color: $color-text-muted;
    text-decoration: none;
    font-size: $text-sm;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>