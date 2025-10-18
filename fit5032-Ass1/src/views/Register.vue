<template>
  <div class="container py-4">
    <h1 class="h3">Register</h1>

    <form class="col-12 col-md-6" @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label" for="reg-name">Name</label>
        <input
          id="reg-name"
          v-model.trim="name"
          class="form-control"
          required
          autocomplete="name"
          autofocus
        />
        <div class="text-danger small" v-if="errors.name" aria-live="polite">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="reg-email">Email</label>
        <input
          id="reg-email"
          v-model.trim="email"
          type="email"
          class="form-control"
          required
          autocomplete="email"
        />
        <div class="text-danger small" v-if="errors.email" aria-live="polite">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="reg-password">Password</label>
        <input
          id="reg-password"
          v-model="password"
          type="password"
          class="form-control"
          minlength="6"
          required
          autocomplete="new-password"
        />
        <div class="text-danger small" v-if="errors.password" aria-live="polite">{{ errors.password }}</div>
      </div>

      <button class="btn btn-primary" :disabled="loading">
        <span v-if="!loading">Create account</span>
        <span v-else>Creating…</span>
      </button>
      <br />

      <button
        type="button"
        class="btn btn-outline-secondary mt-2"
        :disabled="loading"
        @click="firebaseRegister"
      >
        <span v-if="!loading">Register with Firebase</span>
        <span v-else>Creating…</span>
      </button>

      <p class="text-danger small mt-2" v-if="errors.global" aria-live="polite">{{ errors.global }}</p>
    </form>

    <p class="text-muted mt-3 small">Tip: admin will be seeded on first Admin visit.</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = reactive({ name: '', email: '', password: '', global: '' })

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function gotoRedirectOrHome () {
  const redirect = route.query.redirect || { name: 'Home' }
  router.push(redirect)
}

function resetErrors () {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.global = ''
}

const onSubmit = async () => {
  resetErrors()
  errors.name = name.value ? '' : 'Name is required.'
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Valid email required.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.name || errors.email || errors.password) return

  try {
    loading.value = true
    // Local registration + immediate login
    auth.register({ name: name.value, email: email.value, password: password.value })
    await auth.login({ email: email.value, password: password.value })
    gotoRedirectOrHome()
  } catch (e) {
    errors.global = e.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}

function mapFirebaseError (code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.'
    case 'auth/invalid-email':
      return 'Invalid email format.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    default:
      return 'Registration failed. Please try again.'
  }
}

const firebaseRegister = async () => {
  resetErrors()
  errors.name = name.value ? '' : 'Name is required.'
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Valid email required.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.name || errors.email || errors.password) return

  try {
    loading.value = true
    await auth.firebaseRegister({ name: name.value, email: email.value, password: password.value })
    gotoRedirectOrHome()
  } catch (e) {
    errors.global = mapFirebaseError(e.code || '')
  } finally {
    loading.value = false
  }
}
</script>
