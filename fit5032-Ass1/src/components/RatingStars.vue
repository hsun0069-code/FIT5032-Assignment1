<template>
  <div class="rating-stars d-inline-flex" role="radiogroup" aria-label="Rate this resource">
    <span
      v-for="n in 5"
      :key="n"
      role="radio"
      tabindex="0"
      :aria-checked="n === current"
      aria-label="Rate {{ n }} of 5"
      class="star"
      :class="{ active: n <= current }"
      @click="rate(n)"
      @keydown.enter.prevent="rate(n)"
      @keydown.space.prevent="rate(n)"
      @keydown.left.prevent="moveLeft"
      @keydown.right.prevent="moveRight"
    >
      ★
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Current rating status
const current = ref(0)

// Score when user clicks or confirms with keyboard
const rate = (n) => {
  current.value = n
  console.log('Rated', n)
}

// Left and right keys can move the cursor
const moveLeft = () => {
  if (current.value > 1) current.value--
}
const moveRight = () => {
  if (current.value < 5) current.value++
}
</script>

<style scoped>
.star {
  font-size: 1.5rem;
  color: #ccc;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: color 0.2s;
}
.star.active {
  color: #f39c12;
}
.star:focus {
  outline: 2px solid #333;
  border-radius: 4px;
}
</style>

