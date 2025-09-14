<template>
  <NavBar />
  <router-view />
  <footer class="border-top py-3 mt-5">
    <div class="container small text-muted d-flex justify-content-between">
      <span>© NFP Nutrition {{ new Date().getFullYear() }}</span>
      <a href="https://example.org" target="_blank" rel="noopener" class="text-muted">Partners</a>
    </div>
  </footer>
</template>
<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
<style>
:root { scroll-behavior: smooth }
</style>


