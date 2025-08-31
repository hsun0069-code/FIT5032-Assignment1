<template>
  <div class="container py-4">
    <h1 class="h3">Register</h1>
    <form class="col-12 col-md-6" @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model.trim="name" class="form-control" required />
        <div class="text-danger small" v-if="errors.name">{{ errors.name }}</div>
      </div>

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

      <button class="btn btn-primary">Create account</button>
    </form>
    <p class="text-muted mt-3 small">Tip: admin will be seeded on first Admin visit.</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const errors = reactive({})
const auth = useAuthStore()
const router = useRouter()

const onSubmit = () => {
  errors.name = name.value ? '' : 'Name is required.'
  errors.email = !/^\S+@\S+\.\S+$/.test(email.value) ? 'Valid email required.' : ''
  errors.password = password.value.length < 6 ? 'Minimum 6 characters.' : ''
  if (errors.name || errors.email || errors.password) return

  try {
    auth.register({ name: name.value, email: email.value, password: password.value })
    auth.login({ email: email.value, password: password.value })
    router.push({ name: 'Home' })
  } catch (e) {
    errors.email = e.message
  }
}
</script>
