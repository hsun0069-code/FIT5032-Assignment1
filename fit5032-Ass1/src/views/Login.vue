<template>
  <div class="container py-4">
    <h1 class="h3">Login</h1>

    <form class="col-12 col-md-6" @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label" for="login-email">Email</label>
        <input
          id="login-email"
          v-model.trim="email"
          type="email"
          class="form-control"
          required
          autocomplete="email"
          autofocus
        />
        <div class="text-danger small" v-if="errors.email" aria-live="polite">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          class="form-control"
          minlength="6"
          required
          autocomplete="current-password"
        />
        <div class="text-danger small" v-if="errors.password" aria-live="polite">{{ errors.password }}</div>
      </div>

      <button class="btn btn-primary" :disabled="loading">
        <span v-if="!loading">Login</span>
        <span v-else>Logging in…</span>
      </button>

      <br />

      <button
        type="button"
        class="btn btn-outline-secondary mt-2"
        :disabled="loading"
        @click="firebaseLogin"
      >
        <span v-if="!loading">Login with Firebase</span>
        <span v-else>Logging in…</span>
      </button>

      <p class="text-danger small mt-2" v-if="errors.global" aria-live="polite">{{ errors.global }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = reactive({ email: '', password: '', global: '' })

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function gotoRedirectOrHome () {
  const redirect = route.query.redirect || { name: 'Home' }
  router.push(redirect)
}

function resetErrors () {
  errors.email = ''
  errors.password = ''
  errors.global = ''
}

const onSubmit = async () => {
  resetErrors()
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Please enter a valid email.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.email || errors.password) return

  try {
    loading.value = true
    await auth.login({ email: email.value, password: password.value })
    gotoRedirectOrHome()
  } catch {
    errors.global = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}

function mapFirebaseError (code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'User not found.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/invalid-email':
      return 'Invalid email format.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    default:
      return 'Login failed. Please try again.'
  }
}

const firebaseLogin = async () => {
  resetErrors()
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Please enter a valid email.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.email || errors.password) return

  try {
    loading.value = true
    await auth.firebaseLogin({ email: email.value, password: password.value })
    gotoRedirectOrHome()
  } catch (e) {
    errors.global = mapFirebaseError(e.code || '')
  } finally {
    loading.value = false
  }
}
</script>
