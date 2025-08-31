<template>
  <div class="container py-4">
    <h1 class="h3">Login</h1>

    <form class="col-12 col-md-6" @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model.trim="email" type="email" class="form-control" required />
        <div class="text-danger small" v-if="errors.email">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" minlength="6" required />
        <div class="text-danger small" v-if="errors.password">{{ errors.password }}</div>
      </div>

      <button class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const errors = reactive({})
const auth = useAuthStore()
const router = useRouter()

const onSubmit = () => {
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Please enter a valid email.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.email || errors.password) return

  try {
    auth.login({ email: email.value, password: password.value })
    router.push({ name: 'Home' })
  } catch {
    errors.email = 'Invalid credentials'
  }
}
</script>
