<template>
  <div class="container py-4">
    <h1 class="h3">Resources</h1>
    <div class="row g-3">
      <div v-for="r in res.items" :key="r.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ r.title }}</h5>
            <p class="card-text">{{ r.summary }}</p>
            <RouterLink class="btn btn-outline-primary" :to="{ name:'ResourceDetail', params:{ id:r.id } }">View</RouterLink>
          </div>
          <div class="card-footer">
            <RatingStars :avg="res.avgRating(r.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useResourcesStore } from '@/stores/resources'
import RatingStars from '@/components/RatingStars.vue'
const res = useResourcesStore()
</script>
