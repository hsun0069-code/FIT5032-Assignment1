<template>
  <div class="d-inline-flex align-items-center">
    <button v-for="n in 5" :key="n" class="btn btn-sm"
            :class="n <= value ? 'btn-warning' : 'btn-outline-secondary'"
            @click="$emit('rate', n)" aria-label="Rate {{n}} stars">★</button>
    <span class="ms-2">Avg: {{ avg?.toFixed(1) ?? '0.0' }}</span>
  </div>
</template>
<script setup>
defineProps({ value: { type:Number, default:0 }, avg:{ type:Number, default:0 } })
</script>
