<template>
  <nav class="navbar navbar-expand-lg bg-light border-bottom">
    <div class="container">
      <a class="navbar-brand" href="#/">NFP Nutrition</a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#nav"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="nav" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/resources">Resources</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/map">Map</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/admin">Admin</RouterLink>
          </li>
        </ul>

        <div class="d-flex gap-2 align-items-center">
          <span v-if="auth.isAuthenticated">
            Hi, {{ auth.user.name }} ({{ auth.user.role }})
          </span>
          <RouterLink
            v-if="!auth.isAuthenticated"
            class="btn btn-outline-primary btn-sm"
            to="/login"
          >
            Login
          </RouterLink>
          <RouterLink
            v-if="!auth.isAuthenticated"
            class="btn btn-primary btn-sm"
            to="/register"
          >
            Register
          </RouterLink>
          <button
            v-else
            class="btn btn-outline-secondary btn-sm"
            @click="auth.logout()"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
