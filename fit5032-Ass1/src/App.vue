<template>
  <!-- "Skip to main content" link visible only to keyboard users -->
  <a href="#main" class="visually-hidden-focusable">Skip to main content</a>

  <NavBar />

  <!-- The main content area, for jumping to the landing point; tabindex allows the focus to fall here -->
  <main id="main" tabindex="-1" class="min-vh-100">
    <router-view />
  </main>

  <footer class="border-top py-3 mt-5" role="contentinfo">
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
