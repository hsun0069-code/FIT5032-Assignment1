<template>
  <div class="container py-4">
    <h1 class="h3">Admin Only</h1>
    <p>Welcome, admin. This page is protected by role-based guard.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
onMounted(() => auth.seedAdmin())
</script>
